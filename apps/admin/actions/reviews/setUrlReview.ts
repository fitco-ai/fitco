'use server';

import type { ServerActionResponse } from '@/types';
import type { SetUrlReviewRequest } from '@/types/widget-request';
import { seoulDayjs } from '@/utils/date';
import { COMPARABLE_DATE_FORMAT } from '@/utils/formatters';
import {
  database,
  eq,
  memberProductTable,
  orderTable,
  productSpecificationTable,
  reviewTable,
} from '@repo/database';

export async function setUrlReview({
  memberId,
  payload,
}: { memberId: number; payload: SetUrlReviewRequest }): ServerActionResponse<{
  isSuccess: boolean;
}> {
  try {
    const productSpecification = await database
      .select({
        productId: productSpecificationTable.productId,
      })
      .from(productSpecificationTable)
      .where(eq(productSpecificationTable.id, payload.productSpecificationId))
      .then((rows) => rows[0]);

    if (!productSpecification) {
      throw new Error('상품 상세 정보를 찾을 수 없습니다');
    }

    const productId = productSpecification.productId;

    await database.transaction(async (tx) => {
      await tx
        .insert(orderTable)
        .values({
          memberId: memberId,
          productId: productId,
          productSpecificationId: payload.productSpecificationId,
          orderDate: seoulDayjs().format(COMPARABLE_DATE_FORMAT),
        })
        .onConflictDoUpdate({
          target: [
            orderTable.memberId,
            orderTable.productId,
            orderTable.productSpecificationId,
          ],
          set: {
            orderDate: seoulDayjs().format(COMPARABLE_DATE_FORMAT),
          },
        });

      await tx
        .insert(reviewTable)
        .values({
          memberId: memberId,
          productSpecificationId: payload.productSpecificationId,
          content: payload.content,
        })
        .onConflictDoUpdate({
          target: [reviewTable.memberId, reviewTable.productSpecificationId],
          set: {
            content: payload.content,
          },
        });

      await tx.insert(memberProductTable).values({
        memberId,
        productId,
        category: payload.category,
      });
    });

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
