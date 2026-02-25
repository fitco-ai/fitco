'use server';

import type { ServerActionResponse } from '@/types';
import {
  type SelectProduct,
  type SelectProductSpecification,
  asc,
  database,
  eq,
  productSpecificationTable,
  productTable,
} from '@repo/database';

export async function getProductDetailById(
  productId: number
): ServerActionResponse<{
  product: SelectProduct;
  specs: SelectProductSpecification[];
}> {
  try {
    const rows = await database
      .select({
        product: productTable,
        specification: productSpecificationTable,
      })
      .from(productTable)
      .innerJoin(
        productSpecificationTable,
        eq(productSpecificationTable.productId, productTable.id)
      )
      .where(eq(productTable.id, productId))
      .orderBy(asc(productSpecificationTable.size));

    if (!rows.length) {
      throw new Error('Product not found');
    }

    const product = rows[0].product;
    const specifications = rows.map((row) => row.specification);

    return {
      ok: true,
      data: {
        product,
        specs: specifications,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
