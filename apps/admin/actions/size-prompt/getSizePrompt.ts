'use server';

import type { ServerActionResponse } from '@/types';
import type { SelectSizePrompt } from '@repo/database';
import { resolveSizePrompt } from './resolveSizePrompt';

export async function getSizePrompt(): ServerActionResponse<{
  sizePrompt: SelectSizePrompt;
}> {
  try {
    const sizePrompt = await resolveSizePrompt();
    return {
      ok: true,
      data: {
        sizePrompt,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
