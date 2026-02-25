'use server';

import {
  database,
  eq,
  memberProductTable,
  memberTable,
  orderTable,
  recommendationTable,
  reviewTable,
} from '@repo/database';

export async function deleteAccount(memberId: number) {
  try {
    await database.transaction(async (tx) => {
      // 1) 회원 연관 데이터 삭제
      await tx
        .delete(recommendationTable)
        .where(eq(recommendationTable.memberId, memberId));
      await tx.delete(reviewTable).where(eq(reviewTable.memberId, memberId));
      await tx.delete(orderTable).where(eq(orderTable.memberId, memberId));
      await tx
        .delete(memberProductTable)
        .where(eq(memberProductTable.memberId, memberId));

      // 2) 회원 삭제
      await tx.delete(memberTable).where(eq(memberTable.id, memberId));
    });

    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
}
