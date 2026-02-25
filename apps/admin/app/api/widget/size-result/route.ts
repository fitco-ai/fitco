import { getSizeResult } from '@/actions/size-result/getSizeResult';
import {
  getClientIp,
  getHeaders,
  resolveMemberIdFromRequest,
} from '@/app/api/_utils';
import type {
  GetSizeResultRequest,
  GetSizeResultResponseData,
} from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../_config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as GetSizeResultRequest;

    const ip = getClientIp(request);
    const getSizeResultResponse = await getSizeResult(
      memberId,
      payload.cafe24MallId,
      payload.shopNo,
      payload.productNo,
      ip
    );

    const responseData =
      getSizeResultResponse.data as GetSizeResultResponseData;

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
