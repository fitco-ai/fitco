import type { Cafe24Variant, ServerActionResponse } from '@/types';
import { resolveCafe24AccessToken } from './utils';

export async function getCafe24ProductVariant({
  mallId,
  cafe24MallId,
  shopNo,
  productNo,
  variantCode,
}: {
  mallId: number;
  cafe24MallId: string;
  shopNo: number;
  productNo: number;
  variantCode: string;
}): ServerActionResponse<{
  variant: Cafe24Variant;
}> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);

    if (!accessToken) {
      throw new Error('Invalid Request');
    }

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/products/${productNo}/variants/${variantCode}?shop_no=${shopNo}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': process.env.CAFE24_API_VERSION as string,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = (await response.json()) as { variant: Cafe24Variant };

    return {
      ok: true,
      data: {
        variant: data.variant ?? null,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
