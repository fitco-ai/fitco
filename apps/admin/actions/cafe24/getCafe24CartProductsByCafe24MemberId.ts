import type { Cafe24CartProduct, ServerActionResponse } from '@/types';
import { resolveCafe24AccessToken } from './utils';

const LIMIT = 5;

export async function getCafe24CartProductsByCafe24MemberId({
  mallId,
  cafe24MallId,
  shopNo,
  cafe24MemberId,
}: {
  mallId: number;
  cafe24MallId: string;
  shopNo: number;
  cafe24MemberId: string;
}): ServerActionResponse<{
  cartProducts: Cafe24CartProduct[];
}> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);

    if (!accessToken) {
      throw new Error('Invalid Request');
    }

    let offset = 0;
    const result: Record<number, Cafe24CartProduct> = {};

    while (true) {
      let url = `https://${cafe24MallId}.cafe24api.com/api/v2/admin/carts?member_id=${cafe24MemberId}&shop_no=${shopNo}&limit=${LIMIT}`;
      if (offset > 0) {
        url += `&offset=${offset}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': process.env.CAFE24_API_VERSION as string,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }

      const data = (await response.json()) as { carts: Cafe24CartProduct[] };
      for (const cp of data.carts) {
        if (!result[cp.product_no]) {
          result[cp.product_no] = cp;
        }
      }

      const count = data.carts.length;

      if (count < LIMIT) {
        break;
      }

      offset += count;
    }

    return {
      ok: true,
      data: {
        cartProducts: Object.values(result),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
