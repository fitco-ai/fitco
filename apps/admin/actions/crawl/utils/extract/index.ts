import type { Page } from 'puppeteer-core';
import type { SizeData, SizeType } from '../types';
import { extractByAI } from './etc';
import { extractFromSmartFit, smartfitFallback1 } from './smartfit';
import {
  extractFromSnapfit,
  snapfitFallback1,
  snapfitFallback2,
  snapfitFallback3,
  snapfitFallback4,
  snapfitFallback5,
} from './snapfit';

export type ExtractSizeDataResult = {
  sizeData: SizeData[];
  productMaterial: string | null;
} | null;

/**
 * SizeData 첫번째 프로퍼티 => 사이즈명
 */
export const extractSizeData = async (
  type: SizeType,
  page: Page
): Promise<ExtractSizeDataResult> => {
  console.log('Size Type: ', type);
  let result: ExtractSizeDataResult = null;

  if (type === 'SMART_FIT') {
    result = await extractFromSmartFit(page);
    if (!result) {
      result = await smartfitFallback1(page);
    }
  } else if (type === 'SNAPFIT') {
    result = await extractFromSnapfit(page);
    if (!result) {
      result = await snapfitFallback1(page);
    }
    if (!result) {
      result = await snapfitFallback2(page);
    }
    if (!result) {
      result = await snapfitFallback3(page);
    }
    if (!result) {
      result = await snapfitFallback4(page);
    }
    if (!result) {
      result = await snapfitFallback5(page);
    }
  }

  // else if (type === 'SIZE_TABLE') {
  //   result = await extractFromSizeTable(page);
  // }

  if (!result) {
    result = await extractByAI(page);
  }

  if (!result) {
    return null;
  }

  console.log('result', result);

  // 크롤링 잘 안된 케이스 ex) [{사이즈: "S"}, {사이즈: "M"}]
  for (const data of result.sizeData) {
    if (Object.values(data).length <= 1) {
      return null;
    }
  }

  return result;
};

export async function extractCafe24Data(page: Page) {
  const cafe24Data = await page.evaluate(() => {
    try {
      const cafe24MallId = window?.CAFE24.SHOP?.getMallID() ?? null;
      console.log('cafe24MallId', cafe24MallId);

      if (!cafe24MallId) {
        return null;
      }

      const shopNo = window?.CAFE24API?.SHOP_NO ?? window?.EC_SDE_SHOP_NUM;
      const iProductNo = window?.iProductNo;
      const productName = window?.product_name;
      const iCategoryNo = window?.iCategoryNo;
      const origin = window?.location.origin;

      let productImage = window?.ImagePreview?.eBigImgSrc ?? null;

      if (productImage) {
        productImage = productImage.startsWith('https')
          ? productImage
          : `https:${productImage}`;
      } else {
        productImage = `${origin}/web/product/tiny/${window.product_image_tiny}`;
      }

      return {
        cafe24MallId,
        shopNo,
        iProductNo,
        productName: productName.replace(/<[^>]+>/g, ''),
        productImage,
        iCategoryNo,
        origin,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  return cafe24Data;
}
