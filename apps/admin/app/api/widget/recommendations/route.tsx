import { deleteRecommendation } from '@/actions/recommendation/deleteRecommendation';
import { getMemberRecommendations } from '@/actions/recommendation/getMemberRecommendations';
import { getHeaders, resolveMemberIdFromRequest } from '@/app/api/_utils';
import type { DeleteRecommendationRequest } from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../_config';

export async function GET(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log(1);
    const response = await getMemberRecommendations(memberId);
    console.log(2);
    if (!response.data) {
      throw new Error('Error');
    }

    const responseData = response.data;

    return NextResponse.json(responseData, {
      status: 200,
      headers: getHeaders(),
    });
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

    const payload = (await request.json()) as DeleteRecommendationRequest;

    const response = await deleteRecommendation(payload);

    if (!response.data?.isDeleted) {
      throw new Error('Error');
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
