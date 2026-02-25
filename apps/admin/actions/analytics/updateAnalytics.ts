'use server';

import type { ServerActionResponse } from '@/types';
import type { UpdateAnalyticsRequest } from '@/types/widget-request';
import { analyticsTable, database, eq } from '@repo/database';

export async function updateAnalytics({
  analyticsId,
  value,
}: UpdateAnalyticsRequest): ServerActionResponse<null> {
  try {
    await database
      .update(analyticsTable)
      .set(value)
      .where(eq(analyticsTable.id, analyticsId));

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
