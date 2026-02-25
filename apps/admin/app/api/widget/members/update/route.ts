import type { UpdateMemberRequest } from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';
import { updateMember } from '../../../../../actions/members/updateMember';
import { getHeaders, resolveMemberIdFromRequest } from '../../../_utils';

export { OPTIONS } from '../../../_config';

export async function POST(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as UpdateMemberRequest;

    const updateMemberResponse = await updateMember({ memberId, payload });

    if (!updateMemberResponse.ok) {
      throw new Error('updateMemberResponse failed');
    }

    return NextResponse.json({}, { status: 200, headers: getHeaders() });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
