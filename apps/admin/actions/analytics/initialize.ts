'use server';

import type { ServerActionResponse } from '@/types';
import { analyticsTable, database } from '@repo/database';
import { resolveMallId } from '../cafe24/utils';

export async function initializeAnalytics({
  cafe24MallId,
  shopNo,
}: { cafe24MallId: string; shopNo: number }): ServerActionResponse<{
  analyticsId: number;
}> {
  try {
    const mallId = await resolveMallId(cafe24MallId);

    if (!mallId) {
      throw new Error('Failed to resolve mallId');
    }

    const result = await database
      .insert(analyticsTable)
      .values({
        mallId,
        shopNo,
      })
      .returning()
      .then((rows) => rows[0]);

    if (!result) {
      throw new Error('Failed to initialize analytics');
    }

    return {
      ok: true,
      data: {
        analyticsId: result.id,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
