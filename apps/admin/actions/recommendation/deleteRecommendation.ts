'use server';

import type { ServerActionResponse } from '@/types';
import type { DeleteRecommendationRequest } from '@/types/widget-request';
import { database, inArray, recommendationTable } from '@repo/database';

export async function deleteRecommendation(
  payload: DeleteRecommendationRequest
): ServerActionResponse<{ isDeleted: boolean }> {
  try {
    const { recommendationIds } = payload;
    await database
      .delete(recommendationTable)
      .where(inArray(recommendationTable.id, recommendationIds));

    return {
      ok: true,
      data: {
        isDeleted: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
