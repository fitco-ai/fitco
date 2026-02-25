import { deleteReviews } from '@/actions/reviews/deleteReviews';
import { setUrlReview } from '@/actions/reviews/setUrlReview';
import { getHeaders, resolveMemberIdFromRequest } from '@/app/api/_utils';
import type {
  DeleteReviewRequest,
  SetUrlReviewRequest,
} from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../../_config';

export async function POST(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as SetUrlReviewRequest;

    const response = await setUrlReview({ memberId, payload });

    if (!response.data?.isSuccess) {
      throw new Error('setUrlReview failed');
    }

    return NextResponse.json(
      {},
      {
        status: 200,
        headers: getHeaders(),
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as DeleteReviewRequest;

    const response = await deleteReviews(payload);

    if (!response.data?.isDeleted) {
      throw new Error('deleteReviews failed');
    }

    return NextResponse.json(
      {},
      {
        status: 200,
        headers: getHeaders(),
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
