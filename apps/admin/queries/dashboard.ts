import { getAllCartAnalytics } from '@/actions/analytics/getAllCartAnalytics';
import { getAllClickAnalytics } from '@/actions/analytics/getAllClickAnalytics';
import { getAllResultAnalytics } from '@/actions/analytics/getAllResultAnalytics';
import { getCartAnalyticsByMallId } from '@/actions/analytics/getCartAnalyticsByMallId';
import { getClickAnalyticsByMallId } from '@/actions/analytics/getClickAnalyticsByMallId';
import { getResultAnalyticsByMallId } from '@/actions/analytics/getResultAnalyticsByMallId';
import { getWidgetExitViews } from '@/actions/analytics/getWidgetExitViews';
import {
  getMallChartData,
  getMallTotalCount,
} from '@/actions/dashboard/mall-chart';
import {
  getAllProductCount,
  getProductCountByMallId,
} from '@/actions/dashboard/product-count';
import {
  getRecommendationChartData,
  getRecommendationTotalCount,
} from '@/actions/dashboard/recommendation-chart';
import {
  getAllReviewCount,
  getReviewCountByMallId,
} from '@/actions/dashboard/review-count';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './keys';

export function useMallChartData(timeUnit: string) {
  return useQuery({
    queryKey: QueryKeys.mallChartData(timeUnit),
    queryFn: async () => {
      const result = await getMallChartData(timeUnit as any);
      return result;
    },
    enabled: !!timeUnit,
  });
}

export function useMallTotalCount() {
  return useQuery({
    queryKey: QueryKeys.mallTotalCount(),
    queryFn: async () => {
      const result = await getMallTotalCount();
      return result;
    },
  });
}

export function useRecommendationChartData(timeUnit: string) {
  return useQuery({
    queryKey: QueryKeys.recommendationChartData(timeUnit),
    queryFn: async () => {
      const result = await getRecommendationChartData(timeUnit as any);
      return result;
    },
    enabled: !!timeUnit,
  });
}

export function useRecommendationTotalCount() {
  return useQuery({
    queryKey: QueryKeys.recommendationTotalCount(),
    queryFn: async () => {
      const result = await getRecommendationTotalCount();
      return result;
    },
  });
}

export function useAllClickAnalytics() {
  return useQuery({
    queryKey: QueryKeys.allClickAnalytics(),
    queryFn: async () => {
      const result = await getAllClickAnalytics();
      return result;
    },
  });
}

export function useAllResultAnalytics() {
  return useQuery({
    queryKey: QueryKeys.allResultAnalytics(),
    queryFn: async () => {
      const result = await getAllResultAnalytics();
      return result;
    },
  });
}

export function useAllCartAnalytics() {
  return useQuery({
    queryKey: QueryKeys.allCartAnalytics(),
    queryFn: async () => {
      const result = await getAllCartAnalytics();
      return result;
    },
  });
}

export function useClickAnalyticsByMallId(mallId: number, shopNo: number) {
  return useQuery({
    queryKey: QueryKeys.clickAnalyticsByMallId(mallId, shopNo),
    queryFn: async () => {
      const result = await getClickAnalyticsByMallId({ mallId, shopNo });
      return result;
    },
  });
}

export function useResultAnalyticsByMallId(mallId: number, shopNo: number) {
  return useQuery({
    queryKey: QueryKeys.resultAnalyticsByMallId(mallId, shopNo),
    queryFn: async () => {
      const result = await getResultAnalyticsByMallId({ mallId, shopNo });
      return result;
    },
  });
}

export function useCartAnalyticsByMallId(mallId: number, shopNo: number) {
  return useQuery({
    queryKey: QueryKeys.cartAnalyticsByMallId(mallId, shopNo),
    queryFn: async () => {
      const result = await getCartAnalyticsByMallId({ mallId, shopNo });
      return result;
    },
  });
}

export function useAllProductCount() {
  return useQuery({
    queryKey: QueryKeys.allProductCount(),
    queryFn: async () => {
      const result = await getAllProductCount();
      return result;
    },
  });
}

export function useProductCountByMallId(mallId: number, shopNo: number) {
  return useQuery({
    queryKey: QueryKeys.productCountByMallId(mallId, shopNo),
    queryFn: async () => {
      const result = await getProductCountByMallId({ mallId, shopNo });
      return result;
    },
  });
}

export function useAllReviewCount() {
  return useQuery({
    queryKey: QueryKeys.allReviewCount(),
    queryFn: async () => {
      const result = await getAllReviewCount();
      return result;
    },
  });
}

export function useReviewCountByMallId(mallId: number, shopNo: number) {
  return useQuery({
    queryKey: QueryKeys.reviewCountByMallId(mallId, shopNo),
    queryFn: async () => {
      const result = await getReviewCountByMallId({ mallId, shopNo });
      return result;
    },
  });
}

export function useWidgetExitViewsByMallId(mallId: number, shopNo: number) {
  return useQuery({
    queryKey: QueryKeys.exitView(mallId, shopNo),
    queryFn: async () => {
      const result = await getWidgetExitViews({ mallId, shopNo });
      return result.data?.exitViews ?? [];
    },
  });
}

export function useAllWidgetExitViews() {
  return useQuery({
    queryKey: QueryKeys.allExitView(),
    queryFn: async () => {
      const result = await getWidgetExitViews({ mallId: null, shopNo: null });
      return result.data?.exitViews ?? [];
    },
  });
}
