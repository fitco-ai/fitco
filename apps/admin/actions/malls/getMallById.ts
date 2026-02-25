'use server';

import type { ServerActionResponse } from '@/types';
import { type SelectMall, database, eq, mallTable } from '@repo/database';

export async function getMallById(
  mallId: number
): ServerActionResponse<{ mall: SelectMall | null }> {
  try {
    const [mall] = await database
      .select()
      .from(mallTable)
      .where(eq(mallTable.id, mallId));

    return {
      ok: true,
      data: {
        mall: mall ?? null,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
