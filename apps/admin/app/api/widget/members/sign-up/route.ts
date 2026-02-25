import { confirmLoginCode } from '@/actions/members/confirmLoginCode';
import { createMember } from '@/actions/members/createMember';
import { getMemberByPhone } from '@/actions/members/getMemberByPhone';
import { env } from '@/env';
import type { SignUpRequest, SignUpResponseData } from '@/types/widget-request';
import jwt from 'jsonwebtoken';
import { type NextRequest, NextResponse } from 'next/server';
import { promoteMember } from '../../../../../actions/members/promoteMember';
import { getHeaders, resolveMemberIdFromRequest } from '../../../_utils';

export { OPTIONS } from '../../../_config';

/**
 * 회원가입
 * 게스트 => 회원가입 시 promote.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, code, agreements } = (await request.json()) as SignUpRequest;

    const confirmLoginCodeResponse = await confirmLoginCode({ phone, code });

    if (!confirmLoginCodeResponse.data?.isValid) {
      throw new Error('confirmLoginCode failed');
    }

    const { memberId } = resolveMemberIdFromRequest(request);

    // memberId 있으면(게스트 로그인 상태)
    if (memberId) {
      const promoteMemberResponse = await promoteMember({
        memberId,
        phone,
        agreements,
      });

      const member = promoteMemberResponse.data?.member;

      if (!member) {
        throw new Error('promoteMember failed');
      }

      const token = jwt.sign({ id: member.id }, env.WIDGET_JWT_SECRET, {
        expiresIn: '15d',
      });

      const responseData: SignUpResponseData = {
        token,
        member,
      };

      return NextResponse.json(responseData, {
        status: 200,
        headers: getHeaders(),
      });
    }

    const getMemberResponse = await getMemberByPhone({ phone });

    if (!getMemberResponse.ok) {
      throw new Error('getMember failed');
    }

    let member = getMemberResponse.data?.member;

    if (!member) {
      const createMemberResponse = await createMember({ phone, agreements });
      const created = createMemberResponse.data?.member;
      if (!created) {
        throw new Error('createMember failed');
      }
      member = created;
    }

    const token = jwt.sign({ id: member.id }, env.WIDGET_JWT_SECRET, {
      expiresIn: '15d',
    });

    const responseData: SignUpResponseData = {
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
