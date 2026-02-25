import type { Page } from 'puppeteer-core';

export async function extractCategoryNamesFromProductPage(
  page: Page
): Promise<string[] | null> {
  try {
    const categoryNames = await page.evaluate(() => {
      const headCategory = document.querySelector('.xans-product-headcategory');

      if (!headCategory) {
        return null;
      }

      const result: string[] = [];

      const links = headCategory.querySelectorAll('a');

      for (const link of links) {
        const linkText = link.textContent?.trim();
        if (linkText) {
          result.push(linkText);
        }
      }

      return result.length > 0 ? result : null;
    });

    return categoryNames;
  } catch (error) {
    console.error(error);
    return null;
  }
}
