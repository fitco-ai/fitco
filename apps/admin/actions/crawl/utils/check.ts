import type { Page } from 'puppeteer-core';
import type { SizeType } from './types';

export const containerIdPrefixes = {
  smartfit: ['crema-fit-product-combined-detail'],
  snapfit: ['sf_chart_iframe_id', 'snapfit_resultview_iframe'],
};

export const checkType = async (page: Page): Promise<SizeType | null> => {
  try {
    const container = await page.waitForSelector(
      Object.values(containerIdPrefixes)
        .flat()
        .map((prefix) => `iframe[id^="${prefix}"]`)
        .join(', '),
      {
        timeout: 3000,
      }
    );

    if (container) {
      const id = await container?.evaluate((el) => el.id);

      if (id) {
        const isSmartfit = containerIdPrefixes.smartfit.some((prefix) =>
          id.startsWith(prefix)
        );
        if (isSmartfit) {
          return 'SMART_FIT';
        }
        const isSnapfit = containerIdPrefixes.snapfit.some((prefix) =>
          id.startsWith(prefix)
        );
        if (isSnapfit) {
          return 'SNAPFIT';
        }
      }
    }
  } catch {
    console.log('smartfit, snapfit 아님. 계속 진행');
  }

  // const smartFitFrameExists = await page.$(
  //   'iframe[id^="crema-fit-product-combined-detail"]'
  // );

  // if (smartFitFrameExists) {
  //   return 'SMART_FIT';
  // }

  // let snapfitFrameExists = await page.$('iframe[id^="sf_chart_iframe_id"]');
  // if (!snapfitFrameExists) {
  //   snapfitFrameExists = await page.$(
  //     'iframe[id^="snapfit_resultview_iframe"]'
  //   );
  // }

  // if (snapfitFrameExists) {
  //   return 'SNAPFIT';
  // }

  const sizeTableExists = await checkSizeTable(page);
  if (sizeTableExists) {
    return 'SIZE_TABLE';
  }

  return 'ETC';
};

const checkSizeTable = async (page: Page) => {
  return page.evaluate(() => {
    const tables = document.querySelectorAll('table');

    for (const table of tables) {
      const thead = table.querySelector('thead');

      if (thead) {
        const cells = thead.querySelectorAll('th, td');

        for (const cell of cells) {
          const text = cell.textContent?.toLowerCase() || '';
          if (text.includes('size') || text.includes('사이즈')) {
            return true;
          }
        }
      }
    }

    return false;
  });
};
