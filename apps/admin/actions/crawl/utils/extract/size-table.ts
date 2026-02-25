import { extractSizeFromSizeTable } from '@/actions/ai/extractSizeFromSizeTable';
import type { Page } from 'puppeteer-core';
import type { ExtractSizeDataResult } from '.';

export async function extractFromSizeTable(
  page: Page
): Promise<ExtractSizeDataResult> {
  try {
    console.log('extractFromSizeTable');
    page.on('console', (msg) => {
      if (msg.text().includes('[size-table]')) {
        console.log('[Browser Console]', msg.text());
      }
    });

    const sizeTableHTML = await page.evaluate(() => {
      // function horizontalTable(sizeTable: HTMLTableElement): SizeData[] | null {
      //   try {
      //     console.log('[size-table] Horizontal Table');
      //     const header = sizeTable.querySelector('thead tr');
      //     if (!header) {
      //       return null;
      //     }

      //     const headerCells = header.querySelectorAll('th, td');
      //     const headers: string[] = [];
      //     for (const cell of headerCells) {
      //       const headerText = cell.textContent?.trim() || '';
      //       if (headerText) {
      //         headers.push(headerText);
      //       }
      //     }

      //     console.log('[size-table] Headers:', headers);

      //     if (headers.length === 0) {
      //       return null;
      //     }

      //     const rows = sizeTable.querySelectorAll('tbody tr');
      //     if (!rows || rows.length === 0) {
      //       return null;
      //     }

      //     console.log('[size-table] Rows count:', rows.length);
      //     console.log(
      //       '[size-table] First row HTML:',
      //       rows[0]?.outerHTML || 'null'
      //     );

      //     const data: SizeData[] = [];

      //     for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      //       const row = rows[rowIndex];
      //       const cells = row.querySelectorAll('td');
      //       console.log(
      //         `[size-table] Row ${rowIndex + 1} cells count:`,
      //         cells.length
      //       );
      //       console.log(
      //         `[size-table] Row ${rowIndex + 1} HTML:`,
      //         row.outerHTML
      //       );

      //       if (cells.length >= headers.length) {
      //         const rowData: SizeData = {};
      //         for (let i = 0; i < headers.length; i++) {
      //           const headerText = headers[i];
      //           const cellText = cells[i]?.textContent?.trim() || '';
      //           rowData[headerText] = cellText;
      //           console.log(
      //             `[size-table] Row ${rowIndex + 1}, Cell ${i + 1}: ${headerText} = "${cellText}"`
      //           );
      //         }
      //         if (rowData[headers[0]]) {
      //           data.push(rowData);
      //         }
      //       }
      //     }

      //     if (data.length === 0) {
      //       return null;
      //     }

      //     return data;
      //   } catch (error) {
      //     console.error(error);
      //     return null;
      //   }
      // }

      // function verticalTable(sizeTable: HTMLTableElement): SizeData[] | null {
      //   try {
      //     console.log('[size-table] Vertical Table');
      //     const header = sizeTable.querySelector('thead tr');
      //     if (!header) {
      //       return null;
      //     }

      //     const data: SizeData[] = [];

      //     const headerCells = header.querySelectorAll('th, td');
      //     for (const [index, cell] of headerCells.entries()) {
      //       if (index === 0) {
      //         continue;
      //       }
      //       const headerText = cell.textContent?.trim() || '';
      //       if (headerText) {
      //         data.push({
      //           사이즈: headerText,
      //         });
      //       }
      //     }

      //     if (data.length === 0) {
      //       return null;
      //     }

      //     const rows = sizeTable.querySelectorAll('tbody tr');
      //     if (!rows || rows.length === 0) {
      //       return null;
      //     }

      //     console.log('[size-table] Rows count:', rows.length);
      //     console.log(
      //       '[size-table] First row HTML:',
      //       rows[0]?.outerHTML || 'null'
      //     );

      //     for (const row of rows) {
      //       const cells = row.querySelectorAll('th, td');
      //       const [key, ...values] = cells;
      //       for (const [index, value] of values.entries()) {
      //         const keyText = key.textContent?.trim() || '';
      //         const valueText = value.textContent?.trim() || '';
      //         data[index][keyText] = valueText;
      //       }
      //     }

      //     if (data.length === 0) {
      //       return null;
      //     }

      //     return data;
      //   } catch (error) {
      //     console.error(error);
      //     return null;
      //   }
      // }

      const tables = document.querySelectorAll('table');
      let sizeTable: HTMLTableElement | null = null;

      for (const table of tables) {
        const thead = table.querySelector('thead');
        if (thead) {
          const cells = thead.querySelectorAll('th, td');
          for (const cell of cells) {
            const text = cell.textContent?.toLowerCase() || '';
            if (text.includes('size') || text.includes('사이즈')) {
              sizeTable = table;
              break;
            }
          }
        }
        if (sizeTable) {
          break;
        }
      }

      console.log(
        '[size-table] Size table HTML:',
        sizeTable?.outerHTML || 'null'
      );

      if (!sizeTable) {
        return null;
      }

      return sizeTable.outerHTML;
    });

    if (!sizeTableHTML) {
      return null;
    }

    const result = await extractSizeFromSizeTable(sizeTableHTML);

    if (!result) {
      return null;
    }

    return { sizeData: result, productMaterial: null };
  } catch (error) {
    console.error(error);
    return null;
  }
}
