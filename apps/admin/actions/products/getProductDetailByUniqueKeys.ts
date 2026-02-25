'use server';

import type { ServerActionResponse } from '@/types';
import {
  type SelectProduct,
  type SelectProductSpecification,
  and,
  asc,
  database,
  eq,
  productSpecificationTable,
  productTable,
} from '@repo/database';

export async function getProductDetailByUniqueKeys(
  cafe24MallId: string,
  shopNo: number,
  productNo: number
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
      .where(
        and(
          eq(productTable.cafe24MallId, cafe24MallId),
          eq(productTable.shopNo, shopNo),
          eq(productTable.productNo, productNo)
        )
      )
      .orderBy(asc(productSpecificationTable.size));

    if (!rows.length) {
      return {
        ok: true,
        data: undefined,
      };
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
