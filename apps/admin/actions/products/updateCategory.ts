'use server';

import type { ServerActionResponse } from '@/types';
import { database, eq, productTable } from '@repo/database';
import type { PRODUCT_CATEGORIES } from '@repo/database/src/const';

export async function updateCategory(
  productId: number,
  category: (typeof PRODUCT_CATEGORIES)[number]['value']
): ServerActionResponse<{ isUpdated: boolean }> {
  try {
    await database
      .update(productTable)
      .set({ category })
      .where(eq(productTable.id, productId));

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
