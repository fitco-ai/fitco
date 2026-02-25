'use server';

import { database } from '@repo/database';
import { and, count, eq, gte, lt, sql } from '@repo/database';
import { analyticsTable } from '@repo/database/src/schema';

export async function getAllResultAnalytics() {
  try {
    // 전체 데이터 개수
    const totalResult = await database
      .select({
        count: count(),
      })
      .from(analyticsTable);

    // 추천받은 데이터 개수 (result = true)
    const resultResult = await database
      .select({
        count: count(),
      })
      .from(analyticsTable)
      .where(eq(analyticsTable.result, true));

    // 최근 1주일 데이터
    const recentWeekResult = await database
      .select({
        total: count(),
        results: sql<number>`COUNT(CASE WHEN ${analyticsTable.result} = true THEN 1 END)`,
      })
      .from(analyticsTable)
      .where(
        gte(
          analyticsTable.createdAt,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
      );

    // 이전 1주일 데이터
    const previousWeekResult = await database
      .select({
        total: count(),
        results: sql<number>`COUNT(CASE WHEN ${analyticsTable.result} = true THEN 1 END)`,
      })
      .from(analyticsTable)
      .where(
        and(
          gte(
            analyticsTable.createdAt,
            new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          ),
          lt(
            analyticsTable.createdAt,
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          )
        )
      );

    const totalCount = totalResult[0]?.count || 0;
    const resultCount = resultResult[0]?.count || 0;
    const recentWeek = recentWeekResult[0] || { total: 0, results: 0 };
    const previousWeek = previousWeekResult[0] || { total: 0, results: 0 };

    // 추천 사용률 계산
    const overallResultRate =
      totalCount > 0 ? (resultCount / totalCount) * 100 : 0;
    const recentResultRate =
      recentWeek.total > 0 ? (recentWeek.results / recentWeek.total) * 100 : 0;
    const previousResultRate =
      previousWeek.total > 0
        ? (previousWeek.results / previousWeek.total) * 100
        : 0;

    // 변화율 계산
    let changeRate = 0;
    let changeType: 'increase' | 'decrease' | 'no-change' = 'no-change';

    if (previousResultRate > 0) {
      changeRate =
        ((recentResultRate - previousResultRate) / previousResultRate) * 100;
      if (changeRate > 0) {
        changeType = 'increase';
      } else if (changeRate < 0) {
        changeType = 'decrease';
      }
    }

    return {
      totalCount,
      resultCount,
      overallResultRate: Math.round(overallResultRate * 100) / 100, // 소수점 2자리
      recentResultRate: Math.round(recentResultRate * 100) / 100,
      previousResultRate: Math.round(previousResultRate * 100) / 100,
      changeRate: Math.round(Math.abs(changeRate) * 100) / 100,
      changeType,
    };
  } catch (error) {
    console.error('Error fetching result analytics data:', error);
    return {
      totalCount: 0,
      resultCount: 0,
      overallResultRate: 0,
      recentResultRate: 0,
      previousResultRate: 0,
      changeRate: 0,
      changeType: 'no-change' as const,
    };
  }
}
