'use server';

import { database } from '@repo/database';
import { sql } from '@repo/database';
import { mallTable } from '@repo/database/src/schema';

export type TimeUnit = 'day' | 'week' | 'month' | 'year';

export async function getMallTotalCount() {
  try {
    const result = await database
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(mallTable);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching mall total count:', error);
    return 0;
  }
}

export async function getMallChartData(timeUnit: TimeUnit = 'day') {
  try {
    let dateFormat: any;
    let groupBy: any;

    switch (timeUnit) {
      case 'day':
        dateFormat = sql<string>`DATE(${mallTable.createdAt})`;
        groupBy = sql`DATE(${mallTable.createdAt})`;
        break;
      case 'week':
        dateFormat = sql<string>`DATE_TRUNC('week', ${mallTable.createdAt})`;
        groupBy = sql`DATE_TRUNC('week', ${mallTable.createdAt})`;
        break;
      case 'month':
        dateFormat = sql<string>`DATE_TRUNC('month', ${mallTable.createdAt})`;
        groupBy = sql`DATE_TRUNC('month', ${mallTable.createdAt})`;
        break;
      case 'year':
        dateFormat = sql<string>`DATE_TRUNC('year', ${mallTable.createdAt})`;
        groupBy = sql`DATE_TRUNC('year', ${mallTable.createdAt})`;
        break;
      default:
        dateFormat = sql<string>`DATE(${mallTable.createdAt})`;
        groupBy = sql`DATE(${mallTable.createdAt})`;
    }

    const result = await database
      .select({
        date: dateFormat,
        count: sql<number>`COUNT(*)`,
      })
      .from(mallTable)
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
    console.error('Error fetching mall chart data:', error);
    return [];
  }
}
