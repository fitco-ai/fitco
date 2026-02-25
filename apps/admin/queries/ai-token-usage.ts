import {
  getTokenUsageChartData,
  getTokenUsageTotalInRange,
} from '@/actions/token-usage';
import type { TimeUnit } from '@/actions/token-usage';
import { useQuery } from '@tanstack/react-query';

export function useTokenUsageChartData(
  timeUnit: TimeUnit,
  startDate: string,
  endDate: string,
  mallId: number
) {
  return useQuery({
    queryKey: ['token-usage-chart', timeUnit, startDate, endDate, mallId],
    queryFn: async () => {
      const result = await getTokenUsageChartData(
        timeUnit,
        startDate,
        endDate,
        mallId
      );
      return result;
    },
  });
}

export function useTokenUsageTotalInRange(
  startDate: string,
  endDate: string,
  mallId: number
) {
  return useQuery({
    queryKey: ['token-usage-total', startDate, endDate, mallId],
    queryFn: async () => {
      const result = await getTokenUsageTotalInRange(
        startDate,
        endDate,
        mallId
      );
      return result;
    },
    enabled: !!startDate && !!endDate,
  });
}
