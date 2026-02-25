'use server';

import type { ServerActionResponse } from '@/types';
import { database, eq, productSpecificationTable } from '@repo/database';

export async function updateSpec(
  specId: number,
  spec: any
): ServerActionResponse<{ isUpdated: boolean }> {
  try {
    await database
      .update(productSpecificationTable)
      .set({
        spec: spec,
      })
      .where(eq(productSpecificationTable.id, specId));
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
