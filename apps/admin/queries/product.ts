import { getAllMallProductsByMallId } from '@/actions/products/getAllMallProductsByMallId';
import { getProductDetailById } from '@/actions/products/getProductDetailById';
import { updateCategory } from '@/actions/products/updateCategory';
import { updateMaterial } from '@/actions/products/updateMaterial';
import { updateSpec } from '@/actions/products/updateSpec';
import { QueryKeys } from '@/queries/keys';
import type { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useProductDetail(productId: number) {
  return useQuery({
    queryKey: QueryKeys.product(productId),
    queryFn: async () => {
      const response = await getProductDetailById(productId);
      return response.data ?? null;
    },
  });
}

export function useUpdateSpec(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      specId,
      payload,
    }: {
      specId: number;
      payload: Record<string, string>;
    }) => {
      const response = await updateSpec(specId, payload);

      if (!response.ok) {
        throw new Error('Update failed');
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.product(productId) });
    },
  });
}

export function useUpdateCategory(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
    }: { category: (typeof PRODUCT_CATEGORIES)[number]['value'] }) => {
      const response = await updateCategory(productId, category);

      if (!response.ok) {
        throw new Error('Update failed');
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.product(productId) });
    },
  });
}

export function useUpdateMaterial(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ material }: { material: string | null }) => {
      const response = await updateMaterial(productId, material);
      if (!response.ok) {
        throw new Error('Update failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.product(productId) });
    },
  });
}

export function useMallProducts(mallId: number) {
  return useQuery({
    queryKey: QueryKeys.mallProducts(mallId),
    queryFn: async () => {
      const response = await getAllMallProductsByMallId(mallId);
      return response.data?.products ?? [];
    },
  });
}
