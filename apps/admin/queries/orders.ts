import {
  type MemberOrderItem,
  getAllOrdersByMemberId,
} from '@/actions/orders/getAllOrdersByMemberId';
import { deleteReviews } from '@/actions/reviews/deleteReviews';
import { updateReview } from '@/actions/reviews/updateReview';
import type {
  DeleteReviewRequest,
  UpdateReviewRequest,
} from '@/types/widget-request';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from './keys';

export function useMemberOrders(memberId: number) {
  return useQuery({
    queryKey: QueryKeys.memberOrders(memberId),
    enabled: !!memberId,
    queryFn: async () => {
      const response = await getAllOrdersByMemberId(memberId);
      return response.data?.orders ?? [];
    },
  });
}

export function useUpdateReview(memberId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateReviewRequest) => {
      await updateReview({ memberId, payload });
      return payload;
    },
    onSuccess: (payload) => {
      queryClient.setQueryData(
        QueryKeys.memberOrders(memberId),
        (prev: MemberOrderItem[]) => {
          return prev.map((item) => {
            if (item.spec.id === payload.productSpecificationId) {
              return {
                ...item,
                review: {
                  ...item.review,
                  content: payload.content,
                },
              };
            }
            return item;
          });
        }
      );
    },
  });
}

export function useDeleteReview(memberId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DeleteReviewRequest) => {
      await deleteReviews(payload);
      return payload;
    },
    onSuccess: (payload) => {
      queryClient.setQueryData(
        QueryKeys.memberOrders(memberId),
        (prev: MemberOrderItem[]) => {
          return prev.map((item) => {
            if (item.review && payload.reviewIds.includes(item.review.id)) {
              return {
                ...item,
                review: null,
              };
            }
            return item;
          });
        }
      );
    },
  });
}
