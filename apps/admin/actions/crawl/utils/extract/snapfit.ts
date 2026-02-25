import { extractProductMaterial } from '@/actions/ai/extractProductMaterial';
import type { Page } from 'puppeteer-core';
import type { ExtractSizeDataResult } from '.';
import type { SizeData } from '../types';

export async function extractFromSnapfit(
  page: Page
): Promise<ExtractSizeDataResult> {
  try {
    console.log('extractFromSnapfit');
    const iframe = await page.$('iframe[id^="sf_chart_iframe_id"]');
    if (!iframe) {
      return null;
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      return null;
    }

    // 브라우저 콘솔 로그를 캐치
    page.on('console', (msg) => {
      if (msg.text().includes('[snapfit]')) {
        console.log('[Browser Console]', msg.text());
      }
    });

    console.log('[snapfit] iframe found');

    const sizeData = await frame.evaluate(() => {
      console.log('[snapfit] Starting size data extraction...');

      // 베니토 오류
      const sizeSection = document.querySelector('.sfskin_sizeInfos');
      console.log('[snapfit] Size section found:', !!sizeSection);

      if (!sizeSection) {
        console.log('[snapfit] No size section found, returning null');
        return null;
      }

      const table =
        sizeSection.querySelector('.sfskin_table:first-child') ||
        sizeSection.querySelector('.sfskin_table');
      console.log('[snapfit] Table found:', !!table);

      if (!table) {
        console.log('[snapfit] No table found, returning null');
        return null;
      }

      const header = table.querySelector('thead tr');
      console.log('[snapfit] Size section found:', !!header);

      if (!header) {
        console.log('[snapfit] No header row found, returning null');
        return null;
      }

      const headerCells = header.querySelectorAll('th');
      const headers: string[] = [];

      for (const cell of headerCells) {
        const headerText = cell.textContent?.trim() || '';
        if (headerText) {
          headers.push(headerText);
        }
      }

      console.log('[snapfit] Headers extracted:', headers);

      if (headers.length === 0) {
        console.log('[snapfit] No headers found, returning null');
        return null;
      }

      const rows = table.querySelectorAll('tbody tr');
      console.log('[snapfit] Data rows found:', rows.length);

      if (!rows || rows.length === 0) {
        console.log('[snapfit] No data rows found, returning null');
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
            rowData[header] = cellText;
          }

          if (rowData[headers[0]]) {
            sizeData.push(rowData);
          }
        }
      }

      console.log(
        '[snapfit] Final size data extracted:',
        sizeData.length,
        'items'
      );
      console.log('[snapfit] Sample data:', sizeData.slice(0, 2));

      return sizeData;
    });

    if (!sizeData) {
      return null;
    }

    return { sizeData, productMaterial: null };
  } catch (error) {
    console.log('Error in extractFromSnapfit', error);
    console.error(error);
    return null;
  }
}

export async function snapfitFallback1(
  page: Page
): Promise<ExtractSizeDataResult> {
  try {
    console.log('snapfitFallback1');
    const iframe = await page.$('iframe[id^="snapfit_resultview_iframe"]');
    if (!iframe) {
      return null;
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      return null;
    }

    console.log('[snapfit] iframe found');

    const evaluateResult = await frame.evaluate(() => {
      console.log('[snapfit] Starting size data extraction...');

      // const sizeSection = document.querySelector('.size_info_wrap');
      // console.log('[snapfit] Size section found:', !!sizeSection);

      // if (!sizeSection) {
      //   console.log('[snapfit] No size section found, returning null');
      //   return null;
      // }

      const table = document.querySelector('.sf_size_view');
      console.log('[snapfit] Table found:', !!table);

      if (!table) {
        console.log('[snapfit] No table found, returning null');
        return null;
      }

      const header = table.querySelector('thead tr');
      console.log('[snapfit] Size section found:', !!header);

      if (!header) {
        console.log('[snapfit] No header row found, returning null');
        return null;
      }

      const headerCells = header.querySelectorAll('th');
      const headers: string[] = [];

      for (const cell of headerCells) {
        const headerText = cell.textContent?.trim() || '';
        if (headerText) {
          headers.push(headerText);
        }
      }

      console.log('[snapfit] Headers extracted:', headers);

      if (headers.length === 0) {
        console.log('[snapfit] No headers found, returning null');
        return null;
      }

      const rows = table.querySelectorAll(
        'tbody tr'
      ) as NodeListOf<HTMLTableRowElement>;
      console.log('[snapfit] Data rows found:', rows.length);

      if (!rows || rows.length === 0) {
        console.log('[snapfit] No data rows found, returning null');
        return null;
      }

      const sizeData: SizeData[] = [];

      for (const row of rows) {
        const size = row.querySelector('th');
        const dataCells = row.querySelectorAll('td');
        const cells = [size, ...dataCells];

        if (cells.length >= headers.length) {
          const rowData: SizeData = {};

          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const cellText = cells[i]?.textContent?.trim() || '';
            rowData[header] = cellText;
          }

          if (rowData[headers[0]]) {
            sizeData.push(rowData);
          }
        }
      }

      console.log(
        '[snapfit] Final size data extracted:',
        sizeData.length,
        'items'
      );
      console.log('[snapfit] Sample data:', sizeData.slice(0, 2));

      const productInfoContent =
        document.getElementById('sfsnapfit_skin')?.textContent ?? '';

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

    return { sizeData, productMaterial };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function snapfitFallback2(
  page: Page
): Promise<ExtractSizeDataResult> {
  try {
    console.log('snapfitFallback2');
    const iframe = await page.$('iframe[id^="snapfit_resultview_iframe"]');
    if (!iframe) {
      return null;
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      return null;
    }

    console.log('[snapfit] iframe found');

    const evaluateResult = await frame.evaluate(() => {
      console.log('[snapfit] Starting size data extraction...');

      const table =
        document.querySelector('.sfskin_table:first-child') ||
        document.querySelector('.sfskin_table');
      console.log('[snapfit] Table found:', !!table);

      if (!table) {
        console.log('[snapfit] No table found, returning null');
        return null;
      }

      const header = table.querySelector('thead tr');
      console.log('[snapfit] Size section found:', !!header);

      if (!header) {
        console.log('[snapfit] No header row found, returning null');
        return null;
      }

      const headerCells = header.querySelectorAll('th');
      const headers: string[] = [];

      for (const cell of headerCells) {
        const headerText = cell.textContent?.trim() || '';
        if (headerText) {
          headers.push(headerText);
        }
      }

      console.log('[snapfit] Headers extracted:', headers);

      if (headers.length === 0) {
        console.log('[snapfit] No headers found, returning null');
        return null;
      }

      const rows = table.querySelectorAll('tbody tr');
      console.log('[snapfit] Data rows found:', rows.length);

      if (!rows || rows.length === 0) {
        console.log('[snapfit] No data rows found, returning null');
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
            rowData[header] = cellText;
          }

          if (rowData[headers[0]]) {
            sizeData.push(rowData);
          }
        }
      }

      console.log(
        '[snapfit] Final size data extracted:',
        sizeData.length,
        'items'
      );
      console.log('[snapfit] Sample data:', sizeData.slice(0, 2));

      const productInfoContent =
        document.getElementById('sfsnapfit_skin')?.textContent ?? '';

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

    return { sizeData, productMaterial };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function snapfitFallback3(
  page: Page
): Promise<ExtractSizeDataResult> {
  try {
    console.log('snapfitFallback3');
    const iframe = await page.$('iframe[id^="sf_chart_iframe_id"]');
    if (!iframe) {
      return null;
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      return null;
    }

    console.log('[snapfit] iframe found');

    const evaluateResult = await frame.evaluate(() => {
      console.log('[snapfit] Starting size data extraction...');

      const table =
        document.querySelector('.sfskin_table:first-child') ||
        document.querySelector('.sfskin_table');
      console.log('[snapfit] Table found:', !!table);

      if (!table) {
        console.log('[snapfit] No table found, returning null');
        return null;
      }

      const header = table.querySelector('thead tr');
      console.log('[snapfit] Size section found:', !!header);

      if (!header) {
        console.log('[snapfit] No header row found, returning null');
        return null;
      }

      const headerCells = header.querySelectorAll('th');
      const headers: string[] = [];

      for (const cell of headerCells) {
        const headerText = cell.textContent?.trim() || '';
        if (headerText) {
          headers.push(headerText);
        }
      }

      console.log('[snapfit] Headers extracted:', headers);

      if (headers.length === 0) {
        console.log('[snapfit] No headers found, returning null');
        return null;
      }

      const rows = table.querySelectorAll('tbody tr');
      console.log('[snapfit] Data rows found:', rows.length);

      if (!rows || rows.length === 0) {
        console.log('[snapfit] No data rows found, returning null');
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
            rowData[header] = cellText;
          }

          if (rowData[headers[0]]) {
            sizeData.push(rowData);
          }
        }
      }

      console.log(
        '[snapfit] Final size data extracted:',
        sizeData.length,
        'items'
      );
      console.log('[snapfit] Sample data:', sizeData.slice(0, 2));

      const productInfoContent =
        document.getElementById('sfsnapfit_skin')?.textContent ?? '';

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

    return { sizeData, productMaterial };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function snapfitFallback4(
  page: Page
): Promise<ExtractSizeDataResult> {
  try {
    console.log('snapfitFallback4');
    const iframe = await page.$('iframe[id^="sf_chart_iframe_id"]');
    if (!iframe) {
      return null;
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      return null;
    }

    console.log('[snapfit] iframe found');

    const evaluateResult = await frame.evaluate(() => {
      console.log('[snapfit] Starting size data extraction...');

      // thead와 tbody가 모두 있는 .sfskin_table 찾기
      const tables = document.querySelectorAll('.sfskin_table');
      let table: HTMLTableElement | null = null;

      for (const t of tables) {
        const hasThead = t.querySelector('thead');
        const hasTbody = t.querySelector('tbody');
        if (hasThead && hasTbody) {
          table = t as HTMLTableElement;
          break;
        }
      }

      console.log('[snapfit] Table with thead and tbody found:', !!table);
      console.log('[snapfit] table', table?.outerHTML);

      if (!table) {
        console.log('[snapfit] No table found, returning null');
        return null;
      }

      const header = table.querySelector('thead tr');
      console.log('[snapfit] Size section found:', !!header);

      if (!header) {
        console.log('[snapfit] No header row found, returning null');
        return null;
      }

      const headerCells = header.querySelectorAll('th');
      const headers: string[] = [];

      for (const cell of headerCells) {
        const headerText = cell.textContent?.trim() || '';
        if (headerText) {
          headers.push(headerText);
        }
      }

      console.log('[snapfit] Headers extracted:', headers);

      if (headers.length === 0) {
        console.log('[snapfit] No headers found, returning null');
        return null;
      }

      const rows = table.querySelectorAll('tbody tr');
      console.log('[snapfit] Data rows found:', rows.length);

      if (!rows || rows.length === 0) {
        console.log('[snapfit] No data rows found, returning null');
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
            rowData[header] = cellText;
          }

          if (rowData[headers[0]]) {
            sizeData.push(rowData);
          }
        }
      }

      console.log(
        '[snapfit] Final size data extracted:',
        sizeData.length,
        'items'
      );
      console.log('[snapfit] Sample data:', sizeData.slice(0, 2));

      const productInfoContent =
        document.getElementById('sfsnapfit_skin')?.textContent ?? '';

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

    return { sizeData, productMaterial };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function snapfitFallback5(
  page: Page
): Promise<ExtractSizeDataResult> {
  try {
    console.log('snapfitFallback5');
    const iframe = await page.$('iframe[id^="sf_chart_iframe_id"]');
    if (!iframe) {
      return null;
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      return null;
    }

    console.log('[snapfit] iframe found');

    const evaluateResult = await frame.evaluate(() => {
      console.log('[snapfit] Starting size data extraction...');

      const table = document.querySelector('#sfsnapfit_skin table');

      console.log('[snapfit] Table found:', !!table);
      console.log('[snapfit] table', table?.outerHTML);

      if (!table) {
        console.log('[snapfit] No table found, returning null');
        return null;
      }

      const rows = table.querySelectorAll('tbody tr');

      const headers: string[] = [];
      const sizeData: SizeData[] = [];

      for (const [index, row] of rows.entries()) {
        const cells = row.querySelectorAll('th, td');
        if (index === 0) {
          for (const cell of cells) {
            const headerText = cell.textContent?.trim() || '';
            if (headerText) {
              headers.push(headerText);
            }
          }
        } else {
          const rowData: SizeData = {};
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const cellText = cells[i]?.textContent?.trim() || '';
            rowData[header] = cellText;
          }
          sizeData.push(rowData);
        }
      }

      console.log('[snapfit] Sample data:', sizeData.slice(0, 2));

      const productInfoContent =
        document.getElementById('sfsnapfit_skin')?.textContent ?? '';

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

    return { sizeData, productMaterial };
  } catch (error) {
    console.error(error);
    return null;
  }
}
