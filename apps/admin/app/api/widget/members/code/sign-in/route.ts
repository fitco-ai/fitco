import { getMemberByPhone } from '@/actions/members/getMemberByPhone';
import { requestSignInCode } from '@/actions/members/requestSignInCode';
import { getHeaders } from '@/app/api/_utils';
import type { RequestLoginCodeRequest } from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../../../_config';

export async function POST(request: NextRequest) {
  try {
    const { phone } = (await request.json()) as RequestLoginCodeRequest;

    const getMemberResponse = await getMemberByPhone({ phone });

    if (!getMemberResponse.data?.member) {
      throw new Error('User not found');
    }

    const requestSignInCodeResponse = await requestSignInCode({ phone });

    if (!requestSignInCodeResponse.ok) {
      throw new Error('requestSignInCode failed');
    }

    return NextResponse.json({}, { status: 200, headers: getHeaders() });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
