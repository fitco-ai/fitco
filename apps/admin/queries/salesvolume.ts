import { getSalesvolume } from '@/actions/cafe24/getSalesvolume';
import { QueryKeys } from '@/queries/keys';
import type { ComparePeriod } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useSalesvolume(
  mallId: number,
  shopNo: number,
  period: ComparePeriod
) {
  return useQuery({
    queryKey: QueryKeys.salesvolume(mallId, period),
    queryFn: async () => {
      const response = await getSalesvolume(mallId, shopNo, period);
      return response.data ?? null;
    },
  });
}

export function useRefundRate(
  mallId: number,
  shopNo: number,
  period: ComparePeriod
) {
  const {
    data: salesvolumeData,
    isLoading,
    error,
  } = useSalesvolume(mallId, shopNo, period);

  const refundRate = useMemo(() => {
    if (!salesvolumeData) {
      return {
        before: { total: 0, refund: 0, refundRate: 0 },
        after: { total: 0, refund: 0, refundRate: 0 },
      };
    }

    const { before, after } = salesvolumeData;

    return {
      before: {
        total: before.total,
        refund: before.refund,
        refundRate: before.refundRate,
      },
      after: {
        total: after.total,
        refund: after.refund,
        refundRate: after.refundRate,
      },
    };
  }, [salesvolumeData]);

  return {
    data: refundRate,
    isLoading,
    error,
  };
}

export function useSettleCount(
  mallId: number,
  shopNo: number,
  period: ComparePeriod
) {
  const {
    data: salesvolumeData,
    isLoading,
    error,
  } = useSalesvolume(mallId, shopNo, period);

  const settleCount = useMemo(() => {
    if (!salesvolumeData) {
      return {
        before: { total: 0 },
        after: { total: 0 },
      };
    }

    return {
      before: {
        total: salesvolumeData.before.settleCount,
      },
      after: {
        total: salesvolumeData.after.settleCount,
      },
    };
  }, [salesvolumeData]);

  return { data: settleCount, isLoading, error };
}
