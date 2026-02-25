import 'server-only';
import type { ServerActionResponse } from '@/types';
import type { UpdateMemberRequest } from '@/types/widget-request';
import { database, eq, memberTable } from '@repo/database';

export async function updateMember({
  memberId,
  payload,
}: {
  memberId: number;
  payload: UpdateMemberRequest;
}): ServerActionResponse<null> {
  try {
    await database
      .update(memberTable)
      .set({
        ...payload,
      })
      .where(eq(memberTable.id, memberId));

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
