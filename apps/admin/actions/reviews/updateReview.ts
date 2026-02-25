'use server';

import type { ServerActionResponse } from '@/types';
import type { UpdateReviewRequest } from '@/types/widget-request';
import {
  type SelectProduct,
  and,
  database,
  eq,
  productSpecificationTable,
  productTable,
  reviewTable,
} from '@repo/database';

export async function updateReview({
  memberId,
  payload,
}: { memberId: number; payload: UpdateReviewRequest }): ServerActionResponse<{
  isUpdated: boolean;
}> {
  try {
    if (payload.content.trim().length === 0) {
      await database
        .delete(reviewTable)
        .where(
          and(
            eq(reviewTable.memberId, memberId),
            eq(
              reviewTable.productSpecificationId,
              payload.productSpecificationId
            )
          )
        );
      return {
        ok: true,
        data: {
          isUpdated: true,
        },
      };
    }

    await database.transaction(async (tx) => {
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
    });

    return {
      ok: true,
      data: {
        isUpdated: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}

async function resolveProduct(
  productSpecificationId: number
): Promise<SelectProduct> {
  const result = await database
    .select({
      product: productTable,
    })
    .from(productSpecificationTable)
    .innerJoin(
      productTable,
      eq(productSpecificationTable.productId, productTable.id)
    )
    .where(eq(productSpecificationTable.id, productSpecificationId))
    .then((rows) => rows[0]);

  if (!result.product) {
    throw new Error('Product specification not found');
  }

  return result.product;
}
