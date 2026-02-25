import { getCafe24ProductSales } from '@/actions/cafe24/getCafe24ProductSales';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './keys';

export function useCafe24ProductSales(
  mallId: number,
  shopNo: number,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: QueryKeys.productSales(mallId, shopNo, startDate, endDate),
    queryFn: async () => {
      const response = await getCafe24ProductSales({
        mallId,
        shopNo,
        startDate,
        endDate,
      });
      return response.data?.productSales ?? [];
    },
  });
}
