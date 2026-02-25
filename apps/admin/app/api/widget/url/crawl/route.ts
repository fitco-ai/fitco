import { crawlSizeData } from '@/actions/crawl/crawlSizeData';
import { setUrlProduct } from '@/actions/products/setUrlProduct';
import { getHeaders, resolveMemberIdFromRequest } from '@/app/api/_utils';
import type {
  CrawlUrlRequest,
  CrawlUrlResponseData,
} from '@/types/widget-request';
import type { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../../_config';

export type SizeData = Record<string, string>;

export async function POST(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as CrawlUrlRequest;

    const { url } = payload;

    if (!url) {
      return NextResponse.json(
        { error: 'URL 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    const crawlResponse = await crawlSizeData({ url, includeCategory: false });

    if (!crawlResponse.ok) {
      throw new Error('crawlSizeData 실패');
    }

    if (crawlResponse.data?.existingData) {
      const existingData = crawlResponse.data.existingData;
      return NextResponse.json(existingData, {
        status: 200,
        headers: getHeaders(),
      });
    }

    if (!crawlResponse.data?.isValidUrl) {
      const payload: CrawlUrlResponseData = {
        isValidUrl: false,
      };
      return NextResponse.json(payload, {
        status: 200,
        headers: getHeaders(),
      });
    }

    if (
      !crawlResponse.data?.cafe24Data ||
      !crawlResponse.data?.result ||
      !crawlResponse.data?.type
    ) {
      throw new Error('crawlSizeData 실패');
    }

    const {
      cafe24Data,
      result,
      productMaterial,
      categoryNamesFromProductPage,
    } = crawlResponse.data;

    const {
      cafe24MallId,
      shopNo,
      iProductNo,
      productName,
      productImage,
      iCategoryNo,
      origin,
    } = cafe24Data;

    const response = await setUrlProduct({
      cafe24MallId,
      shopNo,
      productNo: Number(iProductNo),
      productName,
      productImage,
      result,
      productMaterial,
      iCategoryNo,
      origin,
      categoryNamesFromProductPage,
      includeCategory: false,
    });

    if (!response.data) {
      throw new Error('setUrlProduct 실패');
    }

    const responseData: CrawlUrlResponseData = {
      isValidUrl: true,
      data: {
        category: response.data.product
          .category as (typeof PRODUCT_CATEGORIES)[number]['value'],
        specs: response.data.specs,
      },
    };
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
