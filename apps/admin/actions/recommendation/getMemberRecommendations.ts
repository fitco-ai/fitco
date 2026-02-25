'use server';

import type { ServerActionResponse } from '@/types';
import type {
  GetMemberRecommendationResponseData,
  Recommendation,
} from '@/types/widget-request';
import {
  database,
  eq,
  mallTable,
  productSpecificationTable,
  productTable,
  recommendationTable,
} from '@repo/database';

export async function getMemberRecommendations(
  memberId: number
): ServerActionResponse<GetMemberRecommendationResponseData> {
  try {
    const result = await database
      .select({
        id: recommendationTable.id,
        productName: productTable.productName,
        productImage: productTable.productImage,
        size: productSpecificationTable.size,
        brand: productTable.brand,
        cafe24MallId: mallTable.cafe24MallId,
        sizeResults: recommendationTable.sizeResults,
      })
      .from(recommendationTable)
      .innerJoin(
        productSpecificationTable,
        eq(
          recommendationTable.productSpecificationId,
          productSpecificationTable.id
        )
      )
      .innerJoin(
        productTable,
        eq(productSpecificationTable.productId, productTable.id)
      )
      .leftJoin(mallTable, eq(productTable.mallId, mallTable.id))
      .where(eq(recommendationTable.memberId, memberId));

    return {
      ok: true,
      data: {
        recommendations: result as Recommendation[],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
