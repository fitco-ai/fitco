import { getSizePrompt } from '@/actions/size-prompt/getSizePrompt';
import { updateSizeComparePrompt } from '@/actions/size-prompt/updateSizeComparePropmt';
import { updateSizePrompt } from '@/actions/size-prompt/updateSizePrompt';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from './keys';

export function useSizePrompt() {
  return useQuery({
    queryKey: QueryKeys.sizePrompt(),
    queryFn: async () => {
      const response = await getSizePrompt();
      return response.data?.sizePrompt ?? null;
    },
  });
}

export function useUpdateSizePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prompt: string) => {
      await updateSizePrompt(prompt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.sizePrompt() });
    },
  });
}

export function useUpdateSizeComparePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prompt: string) => {
      await updateSizeComparePrompt(prompt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.sizePrompt() });
    },
  });
}
