'use server';

import type { CommonSearchParams } from '@/lib/search-params';
import type { ServerActionResponse } from '@/types';
import type { SizeResult } from '@/types/widget-request';
import {
  type Column,
  type SelectMall,
  type SelectMember,
  type SelectProduct,
  type SelectProductSpecification,
  type SelectRecommendation,
  and,
  asc,
  database,
  desc,
  eq,
  ilike,
  mallTable,
  memberTable,
  or,
  productSpecificationTable,
  productTable,
  recommendationTable,
  sql,
} from '@repo/database';
import { IdCodec } from '../utils';

export type RecommendationRow = {
  recommendation: SelectRecommendation & { hashId: string };
  mall: SelectMall;
  member: SelectMember;
  productSpecification: SelectProductSpecification;
  product: SelectProduct;
};

export async function getRecommendations(
  sParams: CommonSearchParams
): ServerActionResponse<{
  recommendations: RecommendationRow[];
  totalItems: number;
}> {
  try {
    const { q, qKey, pageIndex, pageSize, sorting } = sParams;

    const [sortColumn, sortDirection] = sorting.split('.') as [
      keyof typeof recommendationTable,
      'asc' | 'desc',
    ];

    // where 조건
    const conditions: (
      | ReturnType<typeof eq>
      | ReturnType<typeof or>
      | ReturnType<typeof ilike>
    )[] = [];

    if (q) {
      if (qKey === 'all') {
        conditions.push(
          or(
            ilike(memberTable.loginPhone, `%${q}%`),
            ilike(mallTable.cafe24MallId, `%${q}%`),
            ilike(productTable.productName, `%${q}%`)
          )
        );
      } else if (qKey in memberTable) {
        conditions.push(
          ilike(
            memberTable[qKey as keyof typeof memberTable] as Column,
            `%${q}%`
          )
        );
      } else if (qKey in productTable) {
        conditions.push(
          ilike(
            productTable[qKey as keyof typeof productTable] as Column,
            `%${q}%`
          )
        );
      } else if (qKey in mallTable) {
        conditions.push(
          ilike(mallTable[qKey as keyof typeof mallTable] as Column, `%${q}%`)
        );
      }
    }

    const whereExpr = conditions.length ? and(...conditions) : undefined;

    const [{ count }] = await database
      .select({ count: sql<number>`count(*)` })
      .from(recommendationTable)
      .where(whereExpr ?? undefined);

    // 데이터 조회 (정렬 + 페이징)
    const recommendations = await database
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
      .where(whereExpr ?? undefined)
      .orderBy(
        sortDirection === 'desc'
          ? desc(recommendationTable[sortColumn] as Column)
          : asc(recommendationTable[sortColumn] as Column)
      )
      .limit(pageSize)
      .offset(pageIndex * pageSize);

    return {
      ok: true,
      data: {
        recommendations: recommendations.map((r) => ({
          ...r,
          recommendation: {
            ...r.recommendation,
            hashId: IdCodec.recommendation.encode(r.recommendation.id),
          },
        })),
        totalItems: count,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}

export async function getAllRecommendations(): ServerActionResponse<{
  recommendations: RecommendationRow[];
}> {
  try {
    const recommendations = await database
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
      .innerJoin(mallTable, eq(mallTable.id, productTable.mallId));

    /**
     * summary, detail 결과뿐 아니라 all 결과가 존재하는 경우만 필터링
     */
    console.log(recommendations[0].recommendation.sizeResults);
    const filtered = recommendations.filter((r) => {
      const sizeResults = r.recommendation.sizeResults as SizeResult[];
      return sizeResults.every(
        (r) => !!r.title && !!r.subTitle && !!r.descriptions
      );
    });

    console.log('123', filtered.length);

    return {
      ok: true,
      data: {
        recommendations: filtered.map((r) => ({
          ...r,
          recommendation: {
            ...r.recommendation,
            hashId: IdCodec.recommendation.encode(r.recommendation.id),
          },
        })),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
