'use server';

import { seoulDayjs } from '@/utils/date';
import { COMPARABLE_DATE_FORMAT, Formatters } from '@/utils/formatters';
import { and, database, eq, gte, lte } from '@repo/database';
import { aiTokenUsageTable } from '@repo/database/src/schema';

export type TimeUnit = 'day' | 'week' | 'month' | 'year';

export interface TokenUsageData {
  date: string;
  totalTokens: number;
}

export async function getTokenUsageChartData(
  timeUnit: TimeUnit,
  startDate: string,
  endDate: string,
  mallId: number
): Promise<{
  groups: TokenUsageData[];
  totalTokens: number;
  avgTokensPerTimeUnit: number;
} | null> {
  try {
    // startDate와 endDate 사이의 모든 데이터를 가져오기
    const rawData = await database
      .select({
        dateStr: aiTokenUsageTable.dateStr,
        token: aiTokenUsageTable.token,
      })
      .from(aiTokenUsageTable)
      .where(
        and(
          gte(aiTokenUsageTable.dateStr, Formatters.date.daysStart(startDate)),
          lte(aiTokenUsageTable.dateStr, Formatters.date.daysEnd(endDate)),
          mallId === -1 ? undefined : eq(aiTokenUsageTable.mallId, mallId)
        )
      );

    let totalTokens = 0;

    // JavaScript로 그룹핑
    const groupedData = new Map<string, { tokens: number[]; count: number }>();

    for (const item of rawData) {
      totalTokens += item.token;
      let groupKey: string;

      switch (timeUnit) {
        case 'day':
          groupKey = item.dateStr.split(' ')[0];
          break;
        case 'week': {
          const date = new Date(item.dateStr);
          if (Number.isNaN(date.getTime())) {
            continue; // 잘못된 날짜는 건너뛰기
          }

          const dayOfWeek = seoulDayjs(item.dateStr).day();
          const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek - 1;
          // const weekStart = new Date(date);
          // weekStart.setDate(date.getDate() - dayOfWeek);
          groupKey = seoulDayjs(item.dateStr)
            .subtract(daysToSubtract, 'day')
            .format(COMPARABLE_DATE_FORMAT)
            .split(' ')[0];
          break;
        }
        case 'month': {
          const [year, month] = item.dateStr.split('-');
          groupKey = `${year}-${month}`;
          break;
        }
        case 'year': {
          const year = item.dateStr.split('-')[0];
          groupKey = year;
          break;
        }
        default:
          groupKey = item.dateStr;
      }

      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, { tokens: [], count: 0 });
      }

      const group = groupedData.get(groupKey);
      if (group) {
        group.tokens.push(item.token);
        group.count += 1;
      }
    }

    // 결과 데이터 생성
    const result: TokenUsageData[] = Array.from(groupedData.entries())
      .map(([date, data]) => ({
        date,
        totalTokens: data.tokens.reduce((sum, token) => sum + token, 0),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      groups: result,
      totalTokens,
      avgTokensPerTimeUnit:
        result.length > 0
          ? result.reduce((sum, item) => sum + item.totalTokens, 0) /
            result.length
          : 0,
    };
  } catch (error) {
    console.error('Error fetching token usage chart data:', error);
    return null;
  }
}

export async function getTokenUsageTotalInRange(
  startDate: string,
  endDate: string,
  mallId: number
) {
  try {
    const rawData = await database
      .select({
        token: aiTokenUsageTable.token,
      })
      .from(aiTokenUsageTable)
      .where(
        and(
          // sql`${aiTokenUsageTable.dateStr} ~ '^\\d{4}-\\d{2}-\\d{2}$'`,
          gte(aiTokenUsageTable.dateStr, startDate),
          lte(aiTokenUsageTable.dateStr, endDate),
          mallId === -1 ? undefined : eq(aiTokenUsageTable.mallId, mallId)
        )
      );

    const tokens = rawData.map((item) => item.token);
    const totalTokens = tokens.reduce((sum, token) => sum + token, 0);
    const avgTokens = tokens.length > 0 ? totalTokens / tokens.length : 0;

    return {
      totalTokens,
      avgTokens,
    };
  } catch (error) {
    console.error('Error fetching token usage total in range:', error);
    return {
      totalTokens: 0,
      avgTokens: 0,
    };
  }
}
