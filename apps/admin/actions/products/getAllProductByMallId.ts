'use server';

import type { ServerActionResponse } from '@/types';
import {
  type SelectProduct,
  and,
  database,
  eq,
  productTable,
} from '@repo/database';

export async function getAllProductByMallId(
  mallId: number,
  shopNo: number
): ServerActionResponse<{ products: SelectProduct[] }> {
  try {
    const products = await database
      .select()
      .from(productTable)
      .where(
        and(eq(productTable.mallId, mallId), eq(productTable.shopNo, shopNo))
      );
    return {
      ok: true,
      data: {
        products,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
