'use server';

import type { ServerActionResponse } from '@/types';
import {
  type SelectRecommendation,
  and,
  database,
  eq,
  recommendationTable,
} from '@repo/database';

export async function getMemberRecommendation({
  memberId,
  productId,
}: {
  memberId: number;
  productId: number;
}): ServerActionResponse<{
  recommendation: SelectRecommendation | null;
}> {
  try {
    const recommendation = await database
      .select()
      .from(recommendationTable)
      .where(
        and(
          eq(recommendationTable.memberId, memberId),
          eq(recommendationTable.productId, productId)
        )
      )
      .then((rows) => rows[0]);

    return {
      ok: true,
      data: {
        recommendation,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
