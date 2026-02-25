import { getRecommendationDetail } from '@/actions/recommendation/getRecommendationDetail';
import { getAllRecommendations } from '@/actions/recommendation/getRecommendations';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './keys';

export function useRecommendationDetail(recommendationId: number) {
  return useQuery({
    queryKey: QueryKeys.recommendation(recommendationId),
    queryFn: async () => {
      const response = await getRecommendationDetail(recommendationId);
      return response.data?.recommendation ?? null;
    },
  });
}

export function useAllRecommendations() {
  return useQuery({
    queryKey: QueryKeys.allRecommendations(),
    queryFn: async () => {
      const response = await getAllRecommendations();
      return response.data?.recommendations ?? null;
    },
  });
}
