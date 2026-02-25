import type { ServerActionResponse } from '@/types';
import {
  type SelectMember,
  and,
  database,
  eq,
  isNotNull,
  memberTable,
} from '@repo/database';

export async function getAllMembersPhoneMap(): ServerActionResponse<{
  membersPhoneMap: Map<string, SelectMember & { loginPhone: string }>;
}> {
  try {
    const members = await database
      .select()
      .from(memberTable)
      .where(
        and(
          isNotNull(memberTable.loginPhone),
          eq(memberTable.agreementData, true)
        )
      );

    const membersPhoneMap = new Map<
      string,
      SelectMember & { loginPhone: string }
    >();

    for (const member of members) {
      if (!member.loginPhone) {
        continue;
      }
      membersPhoneMap.set(
        member.loginPhone,
        member as SelectMember & { loginPhone: string }
      );
    }

    return {
      ok: true,
      data: {
        membersPhoneMap,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
