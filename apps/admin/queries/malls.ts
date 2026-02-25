import { getAllMallShopsByMallId } from '@/actions/cafe24/getAllMallShopsByMallId';
import { getAllMallSkinsByMallId } from '@/actions/cafe24/getAllMallSkinsByMallId';
import { getFitcoAIScriptTagByMallId } from '@/actions/cafe24/getFitcoAIScriptTagByMallId';
import { getAllMalls } from '@/actions/malls/getAllMalls';
import { getMallById } from '@/actions/malls/getMallById';
import { updateMallMemo } from '@/actions/malls/updateMallMemo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from './keys';

export function useMall(mallId: number) {
  return useQuery({
    queryKey: QueryKeys.mall(mallId),
    queryFn: async () => {
      const response = await getMallById(mallId);
      return response.data?.mall ?? null;
    },
  });
}

export function useAllMallSkins(mallId: number) {
  return useQuery({
    queryKey: QueryKeys.mallSkins(mallId),
    queryFn: async () => {
      const response = await getAllMallSkinsByMallId(mallId);
      return response.data?.skins ?? [];
    },
  });
}

export function useFitcoAIScriptTag(mallId: number, shopNo: number) {
  return useQuery({
    queryKey: QueryKeys.mallScriptTags(mallId, shopNo),
    queryFn: async () => {
      const response = await getFitcoAIScriptTagByMallId(mallId, shopNo);
      return response.data?.fitcoAIScriptTag ?? null;
    },
  });
}

export function useAllMallShops(mallId: number) {
  return useQuery({
    queryKey: QueryKeys.mallShops(mallId),
    queryFn: async () => {
      const response = await getAllMallShopsByMallId(mallId);
      return response.data?.shops ?? [];
    },
  });
}

export function useUpdateMallMemo(mallId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memo: string) => {
      const response = await updateMallMemo(mallId, memo);
      if (!response.ok) {
        throw new Error('Failed to update mall memo');
      }
      return response.data;
    },
    onSuccess: () => {
      // mall 데이터를 다시 불러와서 메모 업데이트를 반영
      queryClient.invalidateQueries({ queryKey: QueryKeys.mall(mallId) });
    },
  });
}

export function useAllMalls() {
  return useQuery({
    queryKey: QueryKeys.allMalls(),
    queryFn: async () => {
      const response = await getAllMalls();
      return response.data?.malls ?? [];
    },
  });
}
