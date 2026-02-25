'use server';

import type { ServerActionResponse } from '@/types';
import {
  type SelectOrder,
  type SelectProduct,
  type SelectProductSpecification,
  type SelectReview,
  and,
  database,
  desc,
  eq,
  orderTable,
  productSpecificationTable,
  productTable,
  reviewTable,
  sql,
} from '@repo/database';

export async function getGuestOrdersByCafe24MemberId({
  cafe24MemberId,
  memberId,
}: {
  cafe24MemberId: string;
  memberId: number;
}): ServerActionResponse<{
  orders: {
    order: SelectOrder;
    product: SelectProduct | null;
    spec: SelectProductSpecification | null;
    review: SelectReview | null;
  }[];
}> {
  try {
    const result = await database
      .select({
        order: orderTable,
        product: productTable,
        spec: productSpecificationTable,
        review: reviewTable,
      })
      .from(orderTable)
      .leftJoin(productTable, eq(orderTable.productId, productTable.id))
      .leftJoin(
        productSpecificationTable,
        and(
          eq(productTable.id, productSpecificationTable.productId),
          eq(productSpecificationTable.id, orderTable.productSpecificationId)
        )
      )
      .leftJoin(
        reviewTable,
        and(
          eq(reviewTable.memberId, memberId),
          eq(reviewTable.productSpecificationId, productSpecificationTable.id)
        )
      )
      .where(eq(orderTable.cafe24MemberId, cafe24MemberId))
      .orderBy(
        sql`(${reviewTable.id} IS NULL) ASC`,
        desc(orderTable.orderDate)
      );

    return {
      ok: true,
      data: { orders: result },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
