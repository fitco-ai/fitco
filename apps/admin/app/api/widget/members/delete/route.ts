import { deleteAccount } from '@/actions/members/deleteAccount';
import type {} from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';
import { getHeaders, resolveMemberIdFromRequest } from '../../../_utils';

export { OPTIONS } from '../../../_config';

/**
 * 회원탈퇴
 */
export async function DELETE(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await deleteAccount(memberId);

    if (!response.ok) {
      throw new Error('deleteAccount failed');
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
