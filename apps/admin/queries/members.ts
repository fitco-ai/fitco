import { getMemberById } from '@/actions/members/getMemberById';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './keys';

export function useMember(memberId: number) {
  return useQuery({
    queryKey: QueryKeys.member(memberId),
    queryFn: async () => {
      const response = await getMemberById(memberId);
      return response.data?.member ?? null;
    },
  });
}
