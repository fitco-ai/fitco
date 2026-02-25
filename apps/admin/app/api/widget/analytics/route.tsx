import { initializeAnalytics } from '@/actions/analytics/initialize';
import { updateAnalytics } from '@/actions/analytics/updateAnalytics';
import { getHeaders } from '@/app/api/_utils';
import type {
  InitializeAnalyticsRequest,
  UpdateAnalyticsRequest,
} from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../_config';

export async function POST(request: NextRequest) {
  try {
    const { cafe24MallId, shopNo } =
      (await request.json()) as InitializeAnalyticsRequest;

    console.log('cafe24MallId', cafe24MallId);
    console.log('shopNo', shopNo);

    const response = await initializeAnalytics({
      cafe24MallId,
      shopNo,
    });

    if (!response.data) {
      throw new Error('Failed to initialize analytics');
    }

    return NextResponse.json(response.data, {
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

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdateAnalyticsRequest;

    const response = await updateAnalytics(body);

    if (!response.ok) {
      throw new Error('Failed to update analytics');
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
