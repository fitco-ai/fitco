'use server';
import type { ServerActionResponse } from '@/types';
import {
  type SelectMall,
  type SelectMember,
  type SelectProduct,
  type SelectProductSpecification,
  type SelectRecommendation,
  database,
  eq,
  mallTable,
  memberTable,
  productSpecificationTable,
  productTable,
  recommendationTable,
} from '@repo/database';

export async function getRecommendationDetail(
  recommendationId: number
): ServerActionResponse<{
  recommendation: {
    recommendation: SelectRecommendation;
    mall: SelectMall;
    member: SelectMember;
    productSpecification: SelectProductSpecification;
    product: SelectProduct;
  };
}> {
  try {
    const recommendation = await database
      .select({
        recommendation: recommendationTable,
        mall: mallTable,
        member: memberTable,
        productSpecification: productSpecificationTable,
        product: productTable,
      })
      .from(recommendationTable)
      .innerJoin(memberTable, eq(memberTable.id, recommendationTable.memberId))
      .innerJoin(
        productSpecificationTable,
        eq(
          productSpecificationTable.id,
          recommendationTable.productSpecificationId
        )
      )
      .innerJoin(
        productTable,
        eq(productTable.id, productSpecificationTable.productId)
      )
      .innerJoin(mallTable, eq(mallTable.id, productTable.mallId))
      .where(eq(recommendationTable.id, recommendationId))
      .then((rows) => rows[0]);

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

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
