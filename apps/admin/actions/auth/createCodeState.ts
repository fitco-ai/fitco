'use server';

import type { ServerActionResponse } from '@/types';
import { codeStateTable, database, eq } from '@repo/database';

export async function createCodeState(
  cafe24MallId: string,
  state: string
): ServerActionResponse<{ isCreated: boolean }> {
  try {
    await database.transaction(async (tx) => {
      await tx
        .delete(codeStateTable)
        .where(eq(codeStateTable.pendingMallId, cafe24MallId));

      await tx.insert(codeStateTable).values({
        pendingMallId: cafe24MallId,
        state,
      });
    });

    return {
      ok: true,
      data: {
        isCreated: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
