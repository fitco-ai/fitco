'use server';

import type { SizeResult } from '@/types/widget-request';
import { and, database, eq, recommendationTable } from '@repo/database';

export async function updateRecommendationDetail({
  memberId,
  productId,
  size,
  newData,
  inputData,
}: {
  memberId: number;
  productId: number;
  size: string;
  newData: { title: string; subTitle: string; descriptions: string[] };
  inputData: any;
}) {
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

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    const sizeResults = recommendation.sizeResults as SizeResult[];
    const newSizeResults = sizeResults.map((sizeResult) => {
      if (sizeResult.size === size) {
        return { ...sizeResult, ...newData };
      }
      return sizeResult;
    });

    await database
      .update(recommendationTable)
      .set({ sizeResults: newSizeResults, input: inputData })
      .where(eq(recommendationTable.id, recommendation.id));

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
