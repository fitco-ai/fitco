'use server';

import { database } from '@repo/database';
import { and, count, eq, gte, lt, sql } from '@repo/database';
import { analyticsTable } from '@repo/database/src/schema';

export async function getAllCartAnalytics() {
  try {
    // 전체 데이터 개수
    const totalResult = await database
      .select({
        count: count(),
      })
      .from(analyticsTable);

    // 클릭된 데이터 개수
    const cartResult = await database
      .select({
        count: count(),
      })
      .from(analyticsTable)
      .where(eq(analyticsTable.cart, true));

    // 최근 1주일 데이터
    const recentWeekResult = await database
      .select({
        total: count(),
        carts: sql<number>`COUNT(CASE WHEN ${analyticsTable.cart} = true THEN 1 END)`,
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
        carts: sql<number>`COUNT(CASE WHEN ${analyticsTable.cart} = true THEN 1 END)`,
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
    const cartCount = cartResult[0]?.count || 0;
    const recentWeek = recentWeekResult[0] || { total: 0, clicks: 0 };
    const previousWeek = previousWeekResult[0] || { total: 0, clicks: 0 };

    // 클릭률 계산
    const overallCartRate = totalCount > 0 ? (cartCount / totalCount) * 100 : 0;
    const recentCartRate =
      recentWeek.total > 0 ? (recentWeek.carts / recentWeek.total) * 100 : 0;
    const previousCartRate =
      previousWeek.total > 0
        ? (previousWeek.carts / previousWeek.total) * 100
        : 0;

    // 변화율 계산
    let changeRate = 0;
    let changeType: 'increase' | 'decrease' | 'no-change' = 'no-change';

    if (previousCartRate > 0) {
      changeRate =
        ((recentCartRate - previousCartRate) / previousCartRate) * 100;
      if (changeRate > 0) {
        changeType = 'increase';
      } else if (changeRate < 0) {
        changeType = 'decrease';
      }
    }

    return {
      totalCount,
      cartCount,
      overallCartRate: Math.round(overallCartRate * 100) / 100, // 소수점 2자리
      recentCartRate: Math.round(recentCartRate * 100) / 100,
      previousCartRate: Math.round(previousCartRate * 100) / 100,
      changeRate: Math.round(Math.abs(changeRate) * 100) / 100,
      changeType,
    };
  } catch (error) {
    console.error('Error fetching click analytics data:', error);
    return {
      totalCount: 0,
      cartCount: 0,
      overallCartRate: 0,
      recentCartRate: 0,
      previousCartRate: 0,
      changeRate: 0,
      changeType: 'no-change' as const,
    };
  }
}
