'use server';

import type { ServerActionResponse } from '@/types';
import type { SizeResult } from '@/types/widget-request';
import { database, recommendationTable } from '@repo/database';

export async function createRecommendation(
  memberId: number,
  productId: number,
  productSpecificationId: number,
  sizeResults: SizeResult[],
  inputData: any,
  ip: string | null
): ServerActionResponse<{ isCreated: boolean }> {
  try {
    await database
      .insert(recommendationTable)
      .values({
        memberId,
        productId,
        productSpecificationId,
        sizeResults,
        input: inputData,
        ip,
      })
      .onConflictDoUpdate({
        target: [recommendationTable.memberId, recommendationTable.productId],
        set: {
          sizeResults,
          productSpecificationId,
          ip,
        },
      });
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
