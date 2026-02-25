'use server';

import type { ServerActionResponse } from '@/types';
import { database, eq, orderTable } from '@repo/database';

/**
 * 최초 핸드폰 인증(초기 회원가입 or promotion) 시 기존에 수집한 주문내역에 memberId 매칭
 */
export async function updateOrderMemberId({
  memberId,
  phone,
}: {
  memberId: number;
  phone: string;
}): ServerActionResponse<{ isSuccess: boolean }> {
  try {
    await database
      .update(orderTable)
      .set({
        memberId,
      })
      .where(eq(orderTable.cafe24BuyerPhone, phone));

    return {
      ok: true,
      data: {
        isSuccess: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
