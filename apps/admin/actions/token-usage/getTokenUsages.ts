'use server';

import type { AiTokenUsageSearchParams } from '@/lib/search-params';
import type { ServerActionResponse } from '@/types';
import {
  type Column,
  type SelectAiTokenUsage,
  type SelectProduct,
  aiTokenUsageTable,
  and,
  asc,
  database,
  desc,
  eq,
  ilike,
  or,
  productTable,
  sql,
} from '@repo/database';

export type AiTokenUsageRow = {
  aiTokenUsage: SelectAiTokenUsage;
  product: SelectProduct | null;
};

export async function getAiTokenUsages(
  sParams: AiTokenUsageSearchParams
): ServerActionResponse<{
  aiTokenUsages: AiTokenUsageRow[];
  totalItems: number;
}> {
  try {
    const { q, qKey, pageIndex, pageSize, sorting } = sParams;

    const [sortColumn, sortDirection] = sorting.split('.') as [
      keyof typeof aiTokenUsageTable,
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
        conditions.push(or(ilike(productTable.productName, `%${q}%`)));
      } else if (qKey in productTable) {
        conditions.push(
          ilike(
            productTable[qKey as keyof typeof productTable] as Column,
            `%${q}%`
          )
        );
      }
    }
    const whereExpr = conditions.length ? and(...conditions) : undefined;

    const [{ count }] = await database
      .select({ count: sql<number>`count(*)` })
      .from(aiTokenUsageTable)
      .leftJoin(productTable, eq(productTable.id, aiTokenUsageTable.productId))
      .where(whereExpr ?? undefined);

    const aiTokenUsages = await database
      .select({
        aiTokenUsage: aiTokenUsageTable,
        product: productTable,
      })
      .from(aiTokenUsageTable)
      .leftJoin(productTable, eq(productTable.id, aiTokenUsageTable.productId))
      .where(whereExpr ?? undefined)
      .orderBy(
        sortDirection === 'desc'
          ? desc(aiTokenUsageTable[sortColumn] as Column)
          : asc(aiTokenUsageTable[sortColumn] as Column)
      )
      .limit(pageSize)
      .offset(pageIndex * pageSize);

    return {
      ok: true,
      data: {
        aiTokenUsages,
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
