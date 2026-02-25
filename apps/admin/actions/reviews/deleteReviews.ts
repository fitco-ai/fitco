'use server';

import type { ServerActionResponse } from '@/types';
import type { DeleteReviewRequest } from '@/types/widget-request';
import { database, inArray, reviewTable } from '@repo/database';

export async function deleteReviews(
  payload: DeleteReviewRequest
): ServerActionResponse<{
  isDeleted: boolean;
}> {
  try {
    const { reviewIds } = payload;
    await database
      .delete(reviewTable)
      .where(inArray(reviewTable.id, reviewIds));
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
