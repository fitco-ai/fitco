import { confirmLoginCode } from '@/actions/members/confirmLoginCode';
import { getMemberByPhone } from '@/actions/members/getMemberByPhone';
import { env } from '@/env';
import type { SignInRequest, SignInResponseData } from '@/types/widget-request';
import jwt from 'jsonwebtoken';
import { type NextRequest, NextResponse } from 'next/server';
import { getHeaders } from '../../../_utils';

export { OPTIONS } from '../../../_config';

/**
 * 로그인
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, code } = (await request.json()) as SignInRequest;

    const confirmLoginCodeResponse = await confirmLoginCode({ phone, code });

    if (!confirmLoginCodeResponse.data?.isValid) {
      throw new Error('confirmLoginCode failed');
    }

    const getMemberResponse = await getMemberByPhone({ phone });

    const member = getMemberResponse.data?.member;

    if (!member) {
      throw new Error('getMember failed');
    }

    const token = jwt.sign({ id: member.id }, env.WIDGET_JWT_SECRET, {
      expiresIn: '15d',
    });

    const responseData: SignInResponseData = {
      token,
      member,
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: getHeaders(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
