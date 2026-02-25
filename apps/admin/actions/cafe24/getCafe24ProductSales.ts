'use server';

import { env } from '@/env';
import type { Cafe24ProductSales, ServerActionResponse } from '@/types';
import { resolveCafe24AccessToken, resolveCafe24MallId } from './utils';

export async function getCafe24ProductSales({
  mallId,
  shopNo,
  startDate,
  endDate,
}: {
  mallId: number;
  shopNo: number;
  startDate: string;
  endDate: string;
}): ServerActionResponse<{
  productSales: Cafe24ProductSales[];
}> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);
    const limit = 1000;
    let offset = 0;
    const result: Cafe24ProductSales[] = [];

    while (true) {
      let url = `https://ca-api.cafe24data.com/products/sales?mall_id=${cafe24MallId}&start_date=${startDate}&end_date=${endDate}&shop_no=${shopNo}&limit=${limit}`;

      if (offset > 0) {
        url += `&offset=${offset}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': env.CAFE24_API_VERSION,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }

      const data = (await response.json()) as { sales: Cafe24ProductSales[] };
      result.push(...data.sales);

      const count = data.sales.length;

      if (count < limit) {
        break;
      }

      offset += limit;
    }

    return {
      ok: true,
      data: {
        productSales: result,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
