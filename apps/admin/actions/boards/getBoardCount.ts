'use server';

import type { ComparePeriod, ServerActionResponse } from '@/types';
import { seoulDayjs } from '@/utils/date';
import { and, count, database, eq, gte, lte } from '@repo/database';
import { boardArticleTable } from '@repo/database/src/schema';
import { getMallById } from '../malls/getMallById';

export async function getBoardCount(
  mallId: number,
  shopNo: number,
  period: ComparePeriod
): ServerActionResponse<{
  before: { total: number };
  after: { total: number };
}> {
  try {
    const mallResponse = await getMallById(mallId);
    const mall = mallResponse.data?.mall;

    if (!mall) {
      throw new Error('Mall not found');
    }

    const createdAt = mall.createdAt;

    const periodMap: Record<
      typeof period,
      { amount: number; unit: 'month' | 'year' }
    > = {
      '1m': { amount: 1, unit: 'month' },
      '3m': { amount: 3, unit: 'month' },
      '6m': { amount: 6, unit: 'month' },
      '1y': { amount: 1, unit: 'year' },
    };
    const duration = periodMap[period];

    // before 기간 (설치 전)
    const beforeStart = seoulDayjs(createdAt)
      .subtract(duration.amount, duration.unit)
      .format('YYYY-MM-DD');
    const beforeEnd = seoulDayjs(createdAt)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    // after 기간 (설치 후)
    const afterStart = seoulDayjs(createdAt).format('YYYY-MM-DD');
    const endCandidate = seoulDayjs(createdAt).add(
      duration.amount,
      duration.unit
    );
    const afterEndDayjs = endCandidate.isAfter(seoulDayjs())
      ? seoulDayjs()
      : endCandidate;
    const afterEnd = afterEndDayjs.format('YYYY-MM-DD');

    // before 기간 게시글 수 조회
    const beforeResult = await database
      .select({ count: count() })
      .from(boardArticleTable)
      .where(
        and(
          eq(boardArticleTable.mallId, mallId),
          eq(boardArticleTable.shopNo, shopNo),
          gte(boardArticleTable.createdDate, beforeStart),
          lte(boardArticleTable.createdDate, beforeEnd)
        )
      );

    // after 기간 게시글 수 조회
    const afterResult = await database
      .select({ count: count() })
      .from(boardArticleTable)
      .where(
        and(
          eq(boardArticleTable.mallId, mallId),
          eq(boardArticleTable.shopNo, shopNo),
          gte(boardArticleTable.createdDate, afterStart),
          lte(boardArticleTable.createdDate, afterEnd)
        )
      );

    const beforeTotal = beforeResult[0]?.count || 0;
    const afterTotal = afterResult[0]?.count || 0;

    return {
      ok: true,
      data: {
        before: { total: beforeTotal },
        after: { total: afterTotal },
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
