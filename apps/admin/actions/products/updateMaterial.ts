'use server';

import type { ServerActionResponse } from '@/types';
import { database, eq, productTable } from '@repo/database';

export async function updateMaterial(
  productId: number,
  material: string | null
): ServerActionResponse<{ isUpdated: boolean }> {
  try {
    await database
      .update(productTable)
      .set({ material })
      .where(eq(productTable.id, productId));

    return {
      ok: true,
      data: { isUpdated: true },
    };
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
}
