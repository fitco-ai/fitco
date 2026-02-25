'use server';

import type { ServerActionResponse } from '@/types';
import type { SelectProduct } from '@repo/database';
import { crawlSizeData } from '../crawl/crawlSizeData';
import { setUrlProduct } from './setUrlProduct';

export async function createProduct(
  cafe24MallId: string,
  shopNo: number,
  productNo: number
): ServerActionResponse<{
  product: SelectProduct;
}> {
  try {
    const url = `https://${cafe24MallId}.cafe24.com/shop${shopNo}/product/detail.html?product_no=${productNo}`;

    const crawlResponse = await crawlSizeData({ url });

    if (
      !crawlResponse.ok ||
      !crawlResponse.data?.isValidUrl ||
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

    const { iProductNo, productName, productImage, iCategoryNo, origin } =
      cafe24Data;

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
    });

    if (!response.data) {
      throw new Error('setUrlProduct 실패');
    }

    return {
      ok: true,
      data: {
        product: response.data.product,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
