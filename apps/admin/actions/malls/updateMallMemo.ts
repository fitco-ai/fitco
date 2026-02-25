'use server';

import type { ServerActionResponse } from '@/types';
import { database, eq, mallTable } from '@repo/database';

export async function updateMallMemo(
  mallId: number,
  memo: string
): ServerActionResponse<{ isUpdated: boolean }> {
  try {
    await database
      .update(mallTable)
      .set({
        memo: memo,
      })
      .where(eq(mallTable.id, mallId));

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
