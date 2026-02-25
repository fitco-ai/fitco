'use server';

import { env } from '@/env';
import type { Cafe24RefreshTokenResponse } from '@/types';
import { seoulDayjs } from '@/utils/date';
import { COMPARABLE_DATE_FORMAT } from '@/utils/formatters';
import { cafe24CredentialTable, database, eq } from '@repo/database';
import { resolveCafe24MallId } from './utils';

export async function refreshTokens(mallId: number, refreshToken: string) {
  try {
    const cafe24MallId = await resolveCafe24MallId(mallId);

    if (!cafe24MallId) {
      return null;
    }

    const clientId = env.NEXT_PUBLIC_CAFE24_CLIENT_ID;
    const clientSecret = env.CAFE24_SECRET_KEY;

    const payload = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/oauth/token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      }
    );

    if (!response.ok) {
      console.log('refresh error');
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = (await response.json()) as Cafe24RefreshTokenResponse;

    const newCredential = await database
      .update(cafe24CredentialTable)
      .set({
        accessToken: data.access_token,
        accessTokenExpiresAt: seoulDayjs(data.expires_at).format(
          COMPARABLE_DATE_FORMAT
        ),
        refreshToken: data.refresh_token,
        refreshTokenExpiresAt: seoulDayjs(data.refresh_token_expires_at).format(
          COMPARABLE_DATE_FORMAT
        ),
      })
      .where(eq(cafe24CredentialTable.mallId, mallId))
      .returning()
      .then((rows) => rows[0]);

    return newCredential;
  } catch (error) {
    console.error(error);
    return null;
  }
}
