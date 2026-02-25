'use server';

import type { ServerActionResponse } from '@/types';
import { type SelectMember, database, eq, memberTable } from '@repo/database';

export async function getMemberById(
  memberId: number
): ServerActionResponse<{ member: SelectMember | null }> {
  try {
    const [member] = await database
      .select()
      .from(memberTable)
      .where(eq(memberTable.id, memberId));

    return {
      ok: true,
      data: {
        member: member ?? null,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
