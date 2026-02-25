'use server';

import { env } from '@/env';
import type {
  Cafe24GetAllMallShopsResponse,
  ServerActionResponse,
  Shop,
} from '@/types';
import { resolveCafe24AccessToken, resolveCafe24MallId } from './utils';

export async function getAllMallShopsByMallId(
  mallId: number
): ServerActionResponse<{ shops: Shop[] }> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/shops`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': env.CAFE24_API_VERSION,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = (await response.json()) as Cafe24GetAllMallShopsResponse;

    return {
      ok: true,
      data: {
        shops: data.shops.map((shop) => ({
          shopNo: shop.shop_no,
          default: shop.default,
          shopName: shop.shop_name,
          pcSkinNo: shop.pc_skin_no,
          mobileSkinNo: shop.mobile_skin_no,
          baseDomain: shop.base_domain,
          primaryDomain: shop.primary_domain,
          slaveDomain: shop.slave_domain,
          active: shop.active,
        })),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
