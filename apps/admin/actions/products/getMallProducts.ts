'use server';

import type { ProductsSearchParams } from '@/lib/search-params';
import type { ServerActionResponse } from '@/types';
import {
  type Column,
  type SelectProduct,
  and,
  asc,
  count,
  database,
  desc,
  eq,
  ilike,
  type inArray,
  or,
  productTable,
} from '@repo/database';

export async function getMallProducts(
  mallId: number,
  sParams: ProductsSearchParams
): ServerActionResponse<{
  products: SelectProduct[];
  totalItems: number;
}> {
  try {
    const { q, qKey, pageIndex, pageSize, sorting } = sParams;

    const [sortColumn, sortDirection] = sorting.split('.') as [
      keyof typeof productTable,
      'asc' | 'desc',
    ];

    // where 조건
    const conditions: (
      | ReturnType<typeof eq>
      | ReturnType<typeof inArray>
      | ReturnType<typeof or>
      | ReturnType<typeof ilike>
    )[] = [eq(productTable.mallId, mallId)];

    if (q) {
      if (qKey === 'all') {
        conditions.push(or(ilike(productTable.productName, `%${q}%`)));
      } else if (qKey in productTable) {
        const column = productTable[
          qKey as keyof typeof productTable
        ] as Column;
        if (column) {
          conditions.push(ilike(column, `%${q}%`));
        }
      }
    }

    const products = await database
      .select()
      .from(productTable)
      .orderBy(
        sortDirection === 'desc'
          ? desc(productTable[sortColumn] as Column)
          : asc(productTable[sortColumn] as Column)
      )
      .where(and(...conditions))
      .limit(pageSize)
      .offset(pageIndex * pageSize);

    const [{ totalItems }] = await database
      .select({ totalItems: count() })
      .from(productTable)
      .where(and(...conditions));

    return {
      ok: true,
      data: {
        products,
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
