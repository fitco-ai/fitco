'use server';

import type { ServerActionResponse } from '@/types';
import { codeStateTable, database, eq } from '@repo/database';

export async function getPendingMallIdByState(
  state: string
): ServerActionResponse<{ isInvalid?: boolean; cafe24MallId?: string }> {
  try {
    const [codeState] = await database
      .select()
      .from(codeStateTable)
      .where(eq(codeStateTable.state, state));

    if (!codeState) {
      return {
        ok: true,
        data: {
          isInvalid: true,
        },
      };
    }

    return {
      ok: true,
      data: {
        cafe24MallId: codeState.pendingMallId,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
