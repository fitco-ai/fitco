'use server';

import type { ServerActionResponse } from '@/types';
import {
  type SelectProduct,
  and,
  database,
  eq,
  isNotNull,
  productTable,
} from '@repo/database';

type MallProduct = Omit<SelectProduct, 'shopNo' | 'productNo'> & {
  shopNo: number;
  productNo: number;
};

export async function getAllMallProductsByMallId(
  mallId: number
): ServerActionResponse<{
  products: MallProduct[];
}> {
  try {
    const products = await database
      .select()
      .from(productTable)
      .where(
        and(
          eq(productTable.mallId, mallId),
          isNotNull(productTable.shopNo),
          isNotNull(productTable.productNo)
        )
      );

    return {
      ok: true,
      data: {
        products: products as MallProduct[],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
