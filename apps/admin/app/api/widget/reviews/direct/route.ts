import { createDirectReview } from '@/actions/reviews/createDirectReview';
import { getHeaders, resolveMemberIdFromRequest } from '@/app/api/_utils';
import type { CreateDirectReviewRequest } from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../../_config';

export async function POST(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as CreateDirectReviewRequest;

    const response = await createDirectReview({ memberId, payload });

    if (!response.data?.isCreated) {
      throw new Error('createDirectReview failed');
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
