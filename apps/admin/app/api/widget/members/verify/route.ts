import { getMemberById } from '@/actions/members/getMemberById';
import type { VerifyMemberResponseData } from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';
import { getHeaders, resolveMemberIdFromRequest } from '../../../_utils';

export { OPTIONS } from '../../../_config';

export async function GET(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const getMemberResponse = await getMemberById(memberId);

    if (!getMemberResponse.ok) {
      throw new Error('getMember failed');
    }

    const responseData: VerifyMemberResponseData = {
      member: getMemberResponse.data?.member ?? null,
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
