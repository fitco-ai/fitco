import 'server-only';
import type { ServerActionResponse } from '@/types';
import { type SelectMember, database, eq, memberTable } from '@repo/database';
import { updateOrderMemberId } from '../orders/updateOrderMemberId';

/**
 * 게스트모드 => 핸드폰 인증으로 승격 시 이미 존재하는 연락처인 경우 해당 멤버로 전환. 기존 게스트 데이터는 유실
 */
export async function promoteMember({
  memberId,
  phone,
  agreements,
}: {
  memberId: number;
  phone: string;
  agreements: string[];
}): ServerActionResponse<{
  member: SelectMember;
}> {
  try {
    const existingMember = await database
      .select()
      .from(memberTable)
      .where(eq(memberTable.loginPhone, phone))
      .then((rows) => rows[0]);

    if (existingMember) {
      return {
        ok: true,
        data: {
          member: existingMember,
        },
      };
    }

    const member = await database
      .update(memberTable)
      .set({
        loginPhone: phone,
        agreementMarketing: agreements.includes('AGREEMENT_MARKETING'),
        agreementData: agreements.includes('AGREEMENT_DATA'),
      })
      .where(eq(memberTable.id, memberId))
      .returning()
      .then((rows) => rows[0]);

    const updateOrderMemberIdResponse = await updateOrderMemberId({
      memberId,
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
