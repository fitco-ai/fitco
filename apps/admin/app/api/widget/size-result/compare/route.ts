import { analyzeCompareSize } from '@/actions/ai/analyzeCompareSize';
import { resolveMallId } from '@/actions/cafe24/utils';
import { getProduct } from '@/actions/products/getProduct';
import { getHeaders, resolveMemberIdFromRequest } from '@/app/api/_utils';
import type {
  GetCompareSizeResultRequest,
  GetCompareSizeResultResponseData,
} from '@/types/widget-request';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../../_config';

export async function POST(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as GetCompareSizeResultRequest;
    const { cafe24MallId, size1, size2, productNo, shopNo } = payload;

    const getProductResponse = await getProduct(
      cafe24MallId,
      shopNo,
      productNo
    );

    if (!getProductResponse.data?.product) {
      throw new Error('Invalid Request');
    }

    const productId = getProductResponse.data.product.id;
    const productMaterial = getProductResponse.data.product.material;

    const mallId = await resolveMallId(cafe24MallId);

    if (!mallId) {
      throw new Error('Invalid Request');
    }

    const analyzeCompareSizeResponse = await analyzeCompareSize({
      mallId,
      size1,
      size2,
      productId,
      productMaterial,
    });

    if (!analyzeCompareSizeResponse) {
      throw new Error('analyzeCompareSize failed');
    }

    const responseData =
      analyzeCompareSizeResponse as GetCompareSizeResultResponseData;

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
