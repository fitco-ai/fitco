import 'server-only';
import type { ServerActionResponse } from '@/types';
import { type SelectMember, database, memberTable } from '@repo/database';
import { updateOrderMemberId } from '../orders/updateOrderMemberId';

export async function createMember({
  phone,
  agreements,
}: { phone: string; agreements: string[] }): ServerActionResponse<{
  member: SelectMember;
}> {
  try {
    const member = await database
      .insert(memberTable)
      .values({
        loginPhone: phone,
        agreementMarketing: agreements.includes('AGREEMENT_MARKETING'),
        agreementData: agreements.includes('AGREEMENT_DATA'),
      })
      .returning()
      .then((rows) => rows[0]);

    if (!member) {
      throw new Error('createMember failed');
    }

    const updateOrderMemberIdResponse = await updateOrderMemberId({
      memberId: member.id,
      phone,
    });

    if (!updateOrderMemberIdResponse.data?.isSuccess) {
      throw new Error('updateOrderMemberId failed');
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
