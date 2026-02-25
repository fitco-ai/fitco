'use server';

import type { CommonSearchParams } from '@/lib/search-params';
import type { ServerActionResponse } from '@/types';
import {
  type Column,
  type SelectMember,
  type SelectProduct,
  type SelectProductSpecification,
  type SelectReview,
  and,
  asc,
  count,
  database,
  desc,
  eq,
  ilike,
  type inArray,
  memberTable,
  or,
  productSpecificationTable,
  productTable,
  reviewTable,
} from '@repo/database';

export type ReviewTableRow = {
  review: SelectReview;
  product: SelectProduct;
  productSpecification: SelectProductSpecification;
  member: SelectMember;
};

export async function getReviews(
  sParams: CommonSearchParams
): ServerActionResponse<{
  reviews: ReviewTableRow[];
  totalItems: number;
}> {
  try {
    const { q, qKey, pageIndex, pageSize, sorting } = sParams;

    const [sortColumn, sortDirection] = sorting.split('.') as [
      keyof typeof reviewTable,
      'asc' | 'desc',
    ];

    // where 조건
    const conditions: (
      | ReturnType<typeof eq>
      | ReturnType<typeof inArray>
      | ReturnType<typeof or>
      | ReturnType<typeof ilike>
    )[] = [];

    if (q) {
      if (qKey === 'all') {
        conditions.push(
          or(
            ilike(productTable.productName, `%${q}%`),
            ilike(memberTable.loginPhone, `%${q}%`)
          )
        );
      } else if (qKey === 'loginPhone') {
        const column = memberTable[qKey as keyof typeof memberTable] as Column;
        if (column) {
          conditions.push(ilike(column, `%${q}%`));
        }
      } else if (qKey === 'productName') {
        const column = productTable[
          qKey as keyof typeof productTable
        ] as Column;
        if (column) {
          conditions.push(ilike(column, `%${q}%`));
        }
      }
    }

    const reviews = await database
      .select({
        review: reviewTable,
        productSpecification: productSpecificationTable,
        product: productTable,
        member: memberTable,
      })
      .from(reviewTable)
      .innerJoin(
        productSpecificationTable,
        eq(reviewTable.productSpecificationId, productSpecificationTable.id)
      )
      .innerJoin(
        productTable,
        eq(productSpecificationTable.productId, productTable.id)
      )
      .innerJoin(memberTable, eq(reviewTable.memberId, memberTable.id))
      .orderBy(
        sortDirection === 'desc'
          ? desc(reviewTable[sortColumn] as Column)
          : asc(reviewTable[sortColumn] as Column)
      )
      .where(and(...conditions))
      .limit(pageSize)
      .offset(pageIndex * pageSize);

    const [{ totalItems }] = await database
      .select({ totalItems: count() })
      .from(reviewTable)
      .innerJoin(
        productSpecificationTable,
        eq(reviewTable.productSpecificationId, productSpecificationTable.id)
      )
      .innerJoin(
        productTable,
        eq(productSpecificationTable.productId, productTable.id)
      )
      .innerJoin(memberTable, eq(reviewTable.memberId, memberTable.id))
      .where(and(...conditions));

    return {
      ok: true,
      data: {
        reviews,
        totalItems,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
