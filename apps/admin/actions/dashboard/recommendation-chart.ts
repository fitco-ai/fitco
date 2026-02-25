'use server';

import { database } from '@repo/database';
import { sql } from '@repo/database';
import { recommendationTable } from '@repo/database/src/schema';

export type TimeUnit = 'day' | 'week' | 'month' | 'year';

export async function getRecommendationTotalCount() {
  try {
    const result = await database
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(recommendationTable);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching recommendation total count:', error);
    return 0;
  }
}

export async function getRecommendationChartData(timeUnit: TimeUnit = 'day') {
  try {
    let dateFormat: any;
    let groupBy: any;

    switch (timeUnit) {
      case 'day':
        dateFormat = sql<string>`DATE(${recommendationTable.createdAt})`;
        groupBy = sql`DATE(${recommendationTable.createdAt})`;
        break;
      case 'week':
        dateFormat = sql<string>`DATE_TRUNC('week', ${recommendationTable.createdAt})`;
        groupBy = sql`DATE_TRUNC('week', ${recommendationTable.createdAt})`;
        break;
      case 'month':
        dateFormat = sql<string>`DATE_TRUNC('month', ${recommendationTable.createdAt})`;
        groupBy = sql`DATE_TRUNC('month', ${recommendationTable.createdAt})`;
        break;
      case 'year':
        dateFormat = sql<string>`DATE_TRUNC('year', ${recommendationTable.createdAt})`;
        groupBy = sql`DATE_TRUNC('year', ${recommendationTable.createdAt})`;
        break;
      default:
        dateFormat = sql<string>`DATE(${recommendationTable.createdAt})`;
        groupBy = sql`DATE(${recommendationTable.createdAt})`;
        break;
    }

    const result = await database
      .select({
        date: dateFormat,
        count: sql<number>`COUNT(*)`,
      })
      .from(recommendationTable)
      .groupBy(groupBy)
      .orderBy(dateFormat);

    // 누적 데이터로 변환
    let cumulative = 0;
    const chartData = result.map((item) => {
      cumulative += Number(item.count);
      return {
        date: item.date,
        count: cumulative,
      };
    });

    return chartData;
  } catch (error) {
    console.error('Error fetching recommendation chart data:', error);
    return [];
  }
}
