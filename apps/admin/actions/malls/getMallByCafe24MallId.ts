'use server';

import type { ServerActionResponse } from '@/types';
import { type SelectMall, database, eq, mallTable } from '@repo/database';

export async function getMallByCafe24MallId(
  cafe24MallId: string
): ServerActionResponse<{ mall: SelectMall | null }> {
  try {
    const [mall] = await database
      .select()
      .from(mallTable)
      .where(eq(mallTable.cafe24MallId, cafe24MallId));

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
