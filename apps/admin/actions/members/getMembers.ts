'use server';

import type { CommonSearchParams } from '@/lib/search-params';
import type { ServerActionResponse } from '@/types';
import {
  type Column,
  type SelectMember,
  and,
  asc,
  count,
  database,
  desc,
  type eq,
  ilike,
  type inArray,
  memberTable,
  or,
} from '@repo/database';

export async function getMembers(
  sParams: CommonSearchParams
): ServerActionResponse<{
  members: SelectMember[];
  totalItems: number;
}> {
  try {
    const { q, qKey, pageIndex, pageSize, sorting } = sParams;

    const [sortColumn, sortDirection] = sorting.split('.') as [
      keyof typeof memberTable,
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
        conditions.push(or(ilike(memberTable.loginPhone, `%${q}%`)));
      } else if (qKey in memberTable) {
        const column = memberTable[qKey as keyof typeof memberTable] as Column;
        if (column) {
          conditions.push(ilike(column, `%${q}%`));
        }
      }
    }

    const members = await database
      .select()
      .from(memberTable)
      .orderBy(
        sortDirection === 'desc'
          ? desc(memberTable[sortColumn] as Column)
          : asc(memberTable[sortColumn] as Column)
      )
      .where(and(...conditions))
      .limit(pageSize)
      .offset(pageIndex * pageSize);

    const [{ totalItems }] = await database
      .select({ totalItems: count() })
      .from(memberTable)
      .where(and(...conditions));

    return {
      ok: true,
      data: {
        members,
        totalItems,
      },
    };
  } catch (error) {
    return {
      ok: false,
    };
  }
}
