import 'server-only';
import type { ServerActionResponse } from '@/types';
import { resolvePuppeteerBrowser } from '@/utils/server';

const BLOCK_REGEX = /analytics|gtm|doubleclick|facebook|hotjar|adservice/;

export async function crawlCafe24CategoryInfo({
  url,
}: {
  url: string;
}): ServerActionResponse<{
  crawledCategory: string | null;
}> {
  try {
    const browser = await resolvePuppeteerBrowser();

    try {
      const page = await browser.newPage();
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

      // 모바일 => 로딩 컨텐츠가 더 적을 가능성 높음
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15A372 Safari/604.1'
      );
      await page.goto(url, {
        timeout: 30000,
        waitUntil: 'domcontentloaded', // SSR or 정적 텍스트 위주
      });

      const category = await page.evaluate(() => {
        const headCategories = document.querySelectorAll(
          '.xans-product-headcategory'
        );

        if (headCategories.length === 1) {
          return (
            headCategories[0].textContent?.replace(/\s+/g, ' ').trim() ?? null
          );
        }

        for (const headCategory of headCategories) {
          if (headCategory.classList.contains('titleArea')) {
            return (
              headCategory.textContent?.replace(/\s+/g, ' ').trim() ?? null
            );
          }
        }

        return null;
      });

      console.log('category', category);

      return {
        ok: true,
        data: { crawledCategory: category },
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
