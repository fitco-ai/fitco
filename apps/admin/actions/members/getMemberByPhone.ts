import 'server-only';
import type { ServerActionResponse } from '@/types';
import { type SelectMember, database, eq, memberTable } from '@repo/database';

export async function getMemberByPhone({
  phone,
}: { phone: string }): ServerActionResponse<{ member: SelectMember | null }> {
  try {
    const member = await database
      .select()
      .from(memberTable)
      .where(eq(memberTable.loginPhone, phone))
      .then((rows) => rows[0]);

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
