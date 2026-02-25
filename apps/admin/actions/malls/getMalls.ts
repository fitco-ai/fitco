'use server';

import type { CommonSearchParams } from '@/lib/search-params';
import type { ServerActionResponse } from '@/types';
import {
  type Column,
  type SelectMall,
  and,
  asc,
  count,
  database,
  desc,
  type eq,
  ilike,
  type inArray,
  mallTable,
  or,
} from '@repo/database';

export async function getMalls(
  sParams: CommonSearchParams
): ServerActionResponse<{
  malls: SelectMall[];
  totalItems: number;
}> {
  try {
    const { q, qKey, pageIndex, pageSize, sorting } = sParams;

    const [sortColumn, sortDirection] = sorting.split('.') as [
      keyof typeof mallTable,
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
        conditions.push(or(ilike(mallTable.cafe24MallId, `%${q}%`)));
      } else if (qKey in mallTable) {
        const column = mallTable[qKey as keyof typeof mallTable] as Column;
        if (column) {
          conditions.push(ilike(column, `%${q}%`));
        }
      }
    }

    const malls = await database
      .select()
      .from(mallTable)
      .orderBy(
        sortDirection === 'desc'
          ? desc(mallTable[sortColumn] as Column)
          : asc(mallTable[sortColumn] as Column)
      )
      .where(and(...conditions))
      .limit(pageSize)
      .offset(pageIndex * pageSize);

    const [{ totalItems }] = await database
      .select({ totalItems: count() })
      .from(mallTable)
      .where(and(...conditions));

    return {
      ok: true,
      data: {
        malls,
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
