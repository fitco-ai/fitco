'use server';

import type { ServerActionResponse } from '@/types';
import { database, eq, sizePromptTable } from '@repo/database';
import { resolveSizePrompt } from './resolveSizePrompt';

export async function updateSizeComparePrompt(
  comparePrompt: string
): ServerActionResponse<{ isUpdated: boolean }> {
  try {
    const sizePrompt = await resolveSizePrompt();

    await database
      .update(sizePromptTable)
      .set({
        comparePrompt,
      })
      .where(eq(sizePromptTable.id, sizePrompt.id));

    return {
      ok: true,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
