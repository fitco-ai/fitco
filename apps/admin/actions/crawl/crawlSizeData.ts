import 'server-only';
import type { ServerActionResponse } from '@/types';
import type { CrawlUrlResponseData } from '@/types/widget-request';
import { USE_CACHE } from '@/utils/common';
import { resolvePuppeteerBrowser } from '@/utils/server';
import type { PRODUCT_CATEGORIES } from '@repo/database';
import { getProductDetailByUniqueKeys } from '../products/getProductDetailByUniqueKeys';
import { checkType } from './utils/check';
import { extractCafe24Data, extractSizeData } from './utils/extract';
import { extractCategoryNamesFromProductPage } from './utils/extract/category';
import type { ExtractResult, SizeType } from './utils/types';

const BLOCK_REGEX = /analytics|gtm|doubleclick|facebook|hotjar|adservice/;

export async function crawlSizeData({
  url,
  includeCategory = true,
}: {
  url: string;
  /**
   * 위젯 => url 크롤링 시 시간 단축을 위해 생략
   */
  includeCategory?: boolean;
}): ServerActionResponse<{
  isValidUrl: boolean;
  result: ExtractResult | null;
  productMaterial: string | null;
  cafe24Data: {
    cafe24MallId: string;
    shopNo: number;
    iProductNo: string;
    productName: string;
    productImage: string;
    iCategoryNo: string;
    origin: string;
  } | null;
  type: SizeType | null;
  categoryNamesFromProductPage: string[] | null;
  existingData?: CrawlUrlResponseData;
}> {
  try {
    const browser = await resolvePuppeteerBrowser();

    try {
      const page = await browser.newPage();

      // 불필요 리소스 차단
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        const url = req.url();
        const block =
          type === 'image' ||
          type === 'media' ||
          type === 'font' ||
          type === 'stylesheet' ||
          type === 'manifest' ||
          BLOCK_REGEX.test(url);
        block ? req.abort() : req.continue();
      });

      // 모바일 => 로딩 컨텐츠가 더 적을 가능성 높음, page로드가 아예 안되는 웹사이트 있어서 보류 https://matinkim.com/product/detail.html?product_no=8107&cate_no=189&display_group=1#none
      // await page.setUserAgent(
      //   'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15A372 Safari/604.1'
      // );

      await page.goto(url, {
        timeout: 20000,
        // waitUntil: 'domcontentloaded'
      });

      // cafe24 url 인지 확인
      const cafe24Data = await extractCafe24Data(page);
      console.log('cafe24Data', cafe24Data);

      if (!cafe24Data) {
        return {
          ok: true,
          data: {
            isValidUrl: false,
            result: null,
            productMaterial: null,
            cafe24Data: null,
            type: null,
            categoryNamesFromProductPage: null,
          },
        };
      }

      if (USE_CACHE) {
        const productDetailResponse = await getProductDetailByUniqueKeys(
          cafe24Data.cafe24MallId,
          Number(cafe24Data.shopNo),
          Number(cafe24Data.iProductNo)
        );

        const productDetailData = productDetailResponse.data;

        if (productDetailData) {
          console.log('cache hit');
          return {
            ok: true,
            data: {
              isValidUrl: true,
              cafe24Data: null,
              categoryNamesFromProductPage: null,
              result: null,
              type: null,
              existingData: {
                isValidUrl: true,
                data: {
                  category: productDetailData.product
                    .category as (typeof PRODUCT_CATEGORIES)[number]['value'],
                  specs: productDetailData.specs,
                },
              },
              productMaterial: productDetailData.product.material,
            },
          };
        }
      }

      const categoryNamesFromProductPage = includeCategory
        ? await extractCategoryNamesFromProductPage(page)
        : null;

      console.log('categoryNamesFromProductPage', categoryNamesFromProductPage);

      const type = await checkType(page);

      if (!type) {
        throw new Error('사이즈표 테이블을 찾을 수 없습니다');
      }

      const result = await extractSizeData(type, page);

      if (!result || result.sizeData.length === 0) {
        throw new Error('추출 실패');
      }

      console.log('크롤링 결과', result);

      return {
        ok: true,
        data: {
          isValidUrl: true,
          result: result.sizeData,
          productMaterial: result.productMaterial,
          cafe24Data,
          type,
          categoryNamesFromProductPage,
        },
      };
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('사이즈표 데이터 추출 중 오류:', error);
    return {
      ok: false,
    };
  }
}
