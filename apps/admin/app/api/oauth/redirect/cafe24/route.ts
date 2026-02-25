import { getPendingMallIdByState } from '@/actions/auth/getPendingMallIdByState';
import { env } from '@/env';
import { seoulDayjs } from '@/utils/date';
import { COMPARABLE_DATE_FORMAT } from '@/utils/formatters';
import {
  cafe24CredentialTable,
  codeStateTable,
  database,
  eq,
  mallTable,
  productTable,
} from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      );
    }

    const codeStateResponse = await getPendingMallIdByState(state);
    const cafe24MallId = codeStateResponse.data?.cafe24MallId;

    if (!codeStateResponse.ok) {
      return NextResponse.json(
        { error: '서버와의 통신 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (codeStateResponse.data?.isInvalid || !cafe24MallId) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      );
    }

    const clientId = env.NEXT_PUBLIC_CAFE24_CLIENT_ID;
    const clientSecret = env.CAFE24_SECRET_KEY;
    const redirectUri = env.NEXT_PUBLIC_CAFE24_REDIRECT_URI;

    const payload = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/oauth/token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
      }
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: '서버와의 통신 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const data = await tokenResponse.json();

    const response = await initializeCafe24Credential(
      cafe24MallId,
      data.access_token,
      seoulDayjs(data.expires_at).format(COMPARABLE_DATE_FORMAT),
      data.refresh_token,
      seoulDayjs(data.refresh_token_expires_at).format(COMPARABLE_DATE_FORMAT)
    );

    if (!response.ok) {
      throw new Error('가입 중 오류가 발생했습니다. 관리자에게 문의해 주세요.');
    }

    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_SITE_URL}/register-success/${cafe24MallId}`
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function initializeCafe24Credential(
  cafe24MallId: string,
  accessToken: string,
  accessTokenExpiresAt: string,
  refreshToken: string,
  refreshTokenExpiresAt: string
) {
  try {
    await database.transaction(async (tx) => {
      const [mall] = await tx
        .insert(mallTable)
        .values({
          cafe24MallId,
        })
        .returning();

      if (!mall) {
        throw new Error('Mall 생성 중 오류가 발생했습니다.');
      }

      // mall이 가입(앱 설치)하기 전에 url 크롤링으로 쌓인 product들 mallId 동기화
      await database
        .update(productTable)
        .set({
          mallId: mall.id,
        })
        .where(eq(productTable.cafe24MallId, cafe24MallId));

      await tx
        .insert(cafe24CredentialTable)
        .values({
          mallId: mall.id,
          accessToken,
          accessTokenExpiresAt,
          refreshToken,
          refreshTokenExpiresAt,
        })
        .onConflictDoUpdate({
          target: [cafe24CredentialTable.mallId],
          set: {
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
          },
        });

      await tx
        .delete(codeStateTable)
        .where(eq(codeStateTable.pendingMallId, cafe24MallId));
    });
    return {
      ok: true,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
