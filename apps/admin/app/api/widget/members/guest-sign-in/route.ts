import { env } from '@/env';
import type { SignInMemberResponseData } from '@/types/widget-request';
import jwt from 'jsonwebtoken';
import { type NextRequest, NextResponse } from 'next/server';
import { createGuestMember } from '../../../../../actions/members/createGuestMember';

export { OPTIONS } from '../../../_config';

export async function GET(request: NextRequest) {
  try {
    const createGuestMemberResponse = await createGuestMember();
    const guestMember = createGuestMemberResponse.data?.member;

    if (!guestMember) {
      throw new Error('createGuestMember failed');
    }

    const token = jwt.sign({ id: guestMember.id }, env.WIDGET_JWT_SECRET, {
      expiresIn: '15d',
    });

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };

    const responseData: SignInMemberResponseData = {
      token,
      member: guestMember,
    };

    return NextResponse.json(responseData, { status: 200, headers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
