'use server';

import type { ServerActionResponse } from '@/types';
import {
  type SelectProductSpecification,
  type SelectReview,
  and,
  database,
  eq,
  memberProductTable,
  productSpecificationTable,
  productTable,
  reviewTable,
} from '@repo/database';
import type { PRODUCT_CATEGORIES } from '@repo/database/src/const';

export async function getAllMemberReviews(
  memberId: number,
  category: (typeof PRODUCT_CATEGORIES)[number]['value']
): ServerActionResponse<{
  reviews: {
    review: SelectReview;
    spec: SelectProductSpecification;
  }[];
}> {
  try {
    const result = await database
      .select({
        review: reviewTable,
        spec: productSpecificationTable,
      })
      .from(reviewTable)
      .innerJoin(
        productSpecificationTable,
        eq(reviewTable.productSpecificationId, productSpecificationTable.id)
      )
      .innerJoin(
        productTable,
        eq(productSpecificationTable.productId, productTable.id)
      )
      .innerJoin(
        memberProductTable,
        and(
          eq(memberProductTable.productId, productTable.id),
          eq(memberProductTable.memberId, memberId)
        )
      )
      .where(
        and(
          eq(reviewTable.memberId, memberId),
          eq(memberProductTable.category, category)
        )
      );

    return {
      ok: true,
      data: { reviews: result },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
