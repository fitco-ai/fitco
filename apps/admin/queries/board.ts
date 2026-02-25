import { getBoardCount } from '@/actions/boards/getBoardCount';
import type { ComparePeriod } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './keys';

export function useBoardCount(
  mallId: number,
  shopNo: number,
  period: ComparePeriod
) {
  return useQuery({
    queryKey: QueryKeys.boardCount(mallId, shopNo, period),
    queryFn: async () => {
      const response = await getBoardCount(mallId, shopNo, period);
      return response.data ?? null;
    },
  });
}
