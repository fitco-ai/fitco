'use server';

import type { ServerActionResponse } from '@/types';
import type { CreateDirectReviewRequest } from '@/types/widget-request';
import { seoulDayjs } from '@/utils/date';
import { COMPARABLE_DATE_FORMAT } from '@/utils/formatters';
import {
  type PRODUCT_CATEGORIES,
  database,
  memberProductTable,
  orderTable,
  productSpecificationTable,
  productTable,
  reviewTable,
} from '@repo/database';

export async function createDirectReview({
  memberId,
  payload,
}: {
  memberId: number;
  payload: CreateDirectReviewRequest;
}): ServerActionResponse<{ isCreated: boolean }> {
  try {
    const { brand, productName, category, size, spec, review } = payload;

    await database.transaction(async (tx) => {
      const product = await tx
        .insert(productTable)
        .values({
          brand,
          category,
          productName,
        })
        .returning()
        .then((rows) => rows[0]);

      if (!product) {
        throw new Error('product not created');
      }

      const productSpecification = await tx
        .insert(productSpecificationTable)
        .values({
          size,
          spec,
          productId: product.id,
        })
        .returning()
        .then((rows) => rows[0]);

      await tx.insert(reviewTable).values({
        memberId,
        productSpecificationId: productSpecification.id,
        content: review,
      });

      await tx.insert(orderTable).values({
        memberId,
        productId: product.id,
        productSpecificationId: productSpecification.id,
        orderDate: seoulDayjs().format(COMPARABLE_DATE_FORMAT),
      });

      await tx.insert(memberProductTable).values({
        memberId,
        productId: product.id,
        category:
          product.category as (typeof PRODUCT_CATEGORIES)[number]['value'],
      });
    });

    return {
      ok: true,
      data: {
        isCreated: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
