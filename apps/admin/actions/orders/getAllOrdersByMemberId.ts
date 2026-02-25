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

export type MemberOrderItem = {
  order: SelectOrder;
  product: SelectProduct;
  spec: SelectProductSpecification;
  review: SelectReview | null;
};

export async function getAllOrdersByMemberId(
  memberId: number
): ServerActionResponse<{
  orders: MemberOrderItem[];
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
      .innerJoin(productTable, eq(orderTable.productId, productTable.id))
      .innerJoin(
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
      .where(eq(orderTable.memberId, memberId))
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
