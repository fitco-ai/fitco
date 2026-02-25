import { getSizeResultDetail } from '@/actions/size-result/getSizeResultDetail';
import {
  getClientIp,
  getHeaders,
  resolveMemberIdFromRequest,
} from '@/app/api/_utils';
import type {
  GetSizeResultDetailRequest,
  GetSizeResultDetailResponseData,
} from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../../_config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as GetSizeResultDetailRequest;

    const ip = getClientIp(request);

    const getSizeResultSummaryResponse = await getSizeResultDetail(
      memberId,
      payload.cafe24MallId,
      payload.shopNo,
      payload.productNo,
      ip,
      payload.size
    );

    const responseData =
      getSizeResultSummaryResponse.data as GetSizeResultDetailResponseData;

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
