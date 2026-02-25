'use server';

import { and, database, eq } from '@repo/database';
import { count } from '@repo/database';
import {
  productSpecificationTable,
  productTable,
  reviewTable,
} from '@repo/database/src/schema';

export async function getAllReviewCount() {
  try {
    // 전체 리뷰 개수
    const totalResult = await database
      .select({
        count: count(),
      })
      .from(reviewTable);

    const totalCount = totalResult[0]?.count || 0;

    return {
      totalCount,
    };
  } catch (error) {
    console.error('Error fetching review count data:', error);
    return {
      totalCount: 0,
    };
  }
}

export async function getReviewCountByMallId({
  mallId,
  shopNo,
}: { mallId: number; shopNo: number }) {
  try {
    const totalResult = await database
      .select({
        count: count(),
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
      .where(
        and(eq(productTable.mallId, mallId), eq(productTable.shopNo, shopNo))
      );

    const totalCount = totalResult[0]?.count || 0;

    return {
      totalCount,
    };
  } catch (error) {
    console.error('Error fetching review count data:', error);
    return {
      totalCount: 0,
    };
  }
}
