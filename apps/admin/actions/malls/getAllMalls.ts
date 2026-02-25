'use server';

import type { ServerActionResponse } from '@/types';
import { type SelectMall, database, mallTable } from '@repo/database';

export async function getAllMalls(): ServerActionResponse<{
  malls: SelectMall[];
}> {
  try {
    const malls = await database.select().from(mallTable);
    return {
      ok: true,
      data: {
        malls,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
