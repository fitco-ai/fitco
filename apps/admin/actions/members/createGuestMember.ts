import 'server-only';
import type { ServerActionResponse } from '@/types';
import { type SelectMember, database, memberTable } from '@repo/database';

export async function createGuestMember(): ServerActionResponse<{
  member: SelectMember | null;
}> {
  try {
    const member = await database
      .insert(memberTable)
      .values({})
      .returning()
      .then((rows) => rows[0]);

    if (!member) {
      return {
        ok: false,
      };
    }

    return {
      ok: true,
      data: {
        member,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
