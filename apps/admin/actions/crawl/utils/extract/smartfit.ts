import { checkSmartfitSizeData } from '@/actions/ai/checkSmartfitSizeData';
import { extractProductMaterial } from '@/actions/ai/extractProductMaterial';
import type { Page } from 'puppeteer-core';
import type { ExtractSizeDataResult } from '.';
import type { SizeData } from '../types';

export async function extractFromSmartFit(
  page: Page
): Promise<ExtractSizeDataResult> {
  try {
    console.log('extractFromSmartFit');
    const iframe = await page.$(
      'iframe[id^="crema-fit-product-combined-detail"]'
    );
    if (!iframe) {
      return null;
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      return null;
    }

    page.on('console', (msg) => {
      if (msg.text().includes('[smartfit]')) {
        console.log('[Browser Console]', msg.text());
      }
    });

    await frame.waitForSelector('#fit-product-size-section', {
      timeout: 10000,
    });

    const evaluateResult = await frame.evaluate(() => {
      const sizeSection = document.querySelector('#fit-product-size-section');
      if (!sizeSection) {
        console.log('[smartfit] No size section found, returning null');
        return null;
      }

      const header = sizeSection.querySelector('thead tr');
      if (!header) {
        console.log('[smartfit] No header row found, returning null');
        return null;
      }

      const headerCells = header.querySelectorAll('td');
      const headers: string[] = [];

      for (const cell of headerCells) {
        const headerText = cell.textContent?.trim() || '';
        if (headerText) {
          headers.push(headerText);
        }
      }

      if (headers.length === 0) {
        console.log('[smartfit] No headers found, returning null');
        return null;
      }

      const rows = sizeSection.querySelectorAll('tbody tr');
      if (!rows || rows.length === 0) {
        return null;
      }

      const sizeData: SizeData[] = [];

      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= headers.length) {
          const rowData: SizeData = {};

          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const cellText = cells[i]?.textContent?.trim() || '';
            rowData[header] = cellText.replace(/\s/g, '');
          }

          if (rowData[headers[0]]) {
            sizeData.push(rowData);
          }
        }
      }

      const productInfo = sizeSection.parentElement?.querySelector(
        '.fit_product_combined_fit_product__info'
      );

      const productInfoContent = productInfo?.textContent?.trim() ?? '';

      return { sizeData, productInfoContent };
    });

    if (!evaluateResult) {
      return null;
    }

    const { sizeData, productInfoContent } = evaluateResult;

    if (!productInfoContent) {
      return {
        sizeData,
        productMaterial: null,
      };
    }

    const productMaterial = await extractProductMaterial(productInfoContent);

    if (sizeData.length === 1) {
      const result = await checkSmartfitSizeData(sizeData[0]);
      if (!result) {
        return null;
      }
      return { sizeData: [result], productMaterial };
    }

    return { sizeData, productMaterial };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function smartfitFallback1(
  page: Page
): Promise<ExtractSizeDataResult> {
  try {
    console.log('smartfitFallback1');
    const iframe = await page.$(
      'iframe[id^="crema-fit-product-combined-detail"]'
    );
    if (!iframe) {
      return null;
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      return null;
    }

    await frame.waitForSelector('#fit-product-size-section', {
      timeout: 10000,
    });

    const evaluateResult = await frame.evaluate(() => {
      const sizeSection = document.querySelector('#fit-product-size-section');
      if (!sizeSection) {
        console.log('[smartfit] No size section found, returning null');
        return null;
      }

      const rows = sizeSection.querySelectorAll('tbody tr');

      if (!rows || rows.length === 0) {
        return null;
      }

      const sizeData: SizeData[] = [];

      for (const [rowIndex, row] of rows.entries()) {
        const header = row.querySelector('th');
        const headerText = header?.textContent?.trim() || '';
        const cells = row.querySelectorAll('td');

        if (rowIndex === 0) {
          for (const cell of cells) {
            const cellText = cell?.textContent?.trim() || '';
            sizeData.push({
              사이즈: cellText,
            });
          }
        } else {
          for (const [cellIndex, cell] of cells.entries()) {
            const cellText = cell?.textContent?.trim() || '';
            sizeData[cellIndex][headerText] = cellText;
          }
        }
      }

      const productInfo = sizeSection.parentElement?.querySelector(
        '.fit_product_combined_fit_product__info'
      );

      const productInfoContent = productInfo?.textContent?.trim() || '';

      return { sizeData, productInfoContent };
    });

    if (!evaluateResult) {
      return null;
    }

    const { sizeData, productInfoContent } = evaluateResult;

    const productMaterial = await extractProductMaterial(productInfoContent);

    return { sizeData, productMaterial };
  } catch (error) {
    console.error(error);
    return null;
  }
}
