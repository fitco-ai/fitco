'use server';

import {
  and,
  database,
  eq,
  productSpecificationTable,
  productTable,
} from '@repo/database';

export async function getProductSpecifications(
  mallId: number,
  shopNo: number,
  productNo: number
) {
  const rows = await database
    .select({ spec: productSpecificationTable })
    .from(productSpecificationTable)
    .innerJoin(
      productTable,
      eq(productSpecificationTable.productId, productTable.id)
    )
    .where(
      and(
        eq(productTable.mallId, mallId),
        eq(productTable.shopNo, shopNo),
        eq(productTable.productNo, productNo)
      )
    );

  return rows.map((r) => r.spec);
}
