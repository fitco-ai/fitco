'use server';

import { and, database, eq } from '@repo/database';
import { count, isNotNull, isNull } from '@repo/database';
import { productTable } from '@repo/database/src/schema';

export async function getAllProductCount() {
  try {
    // 전체 상품 개수
    const totalResult = await database
      .select({
        count: count(),
      })
      .from(productTable);

    // 외부 상품 개수 (mallId가 null)
    const externalResult = await database
      .select({
        count: count(),
      })
      .from(productTable)
      .where(isNull(productTable.mallId));

    // 쇼핑몰 상품 개수 (mallId가 not null)
    const mallResult = await database
      .select({
        count: count(),
      })
      .from(productTable)
      .where(isNotNull(productTable.mallId));

    const totalCount = totalResult[0]?.count || 0;
    const externalCount = externalResult[0]?.count || 0;
    const mallCount = mallResult[0]?.count || 0;

    return {
      totalCount,
      externalCount,
      mallCount,
    };
  } catch (error) {
    console.error('Error fetching product count data:', error);
    return {
      totalCount: 0,
      externalCount: 0,
      mallCount: 0,
    };
  }
}

export async function getProductCountByMallId({
  mallId,
  shopNo,
}: { mallId: number; shopNo: number }) {
  try {
    // 쇼핑몰 상품 개수
    const totalResult = await database
      .select({
        count: count(),
      })
      .from(productTable)
      .where(
        and(eq(productTable.mallId, mallId), eq(productTable.shopNo, shopNo))
      );

    const totalCount = totalResult[0]?.count || 0;

    return {
      totalCount,
    };
  } catch (error) {
    console.error('Error fetching product count data:', error);
    return {
      totalCount: 0,
    };
  }
}
