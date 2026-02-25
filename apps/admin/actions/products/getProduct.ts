'use server';

import type { ServerActionResponse } from '@/types';
import {
  type SelectProduct,
  and,
  database,
  eq,
  productTable,
} from '@repo/database';

export async function getProduct(
  cafe24MallId: string,
  shopNo: number,
  productNo: number
): ServerActionResponse<{ product: SelectProduct | null }> {
  try {
    const product = await database
      .select()
      .from(productTable)
      .where(
        and(
          eq(productTable.cafe24MallId, cafe24MallId),
          eq(productTable.shopNo, shopNo),
          eq(productTable.productNo, productNo)
        )
      )
      .then((rows) => rows[0]);
    return {
      ok: true,
      data: {
        product,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
