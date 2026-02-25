'use server';

import { env } from '@/env';
import type {
  Cafe24GetProductOptionsResponse,
  ServerActionResponse,
} from '@/types';
import type { ProductOption } from '@/types/product-option';
import { extractSizeOption } from '../ai/extractSizeOption';
import { resolveCafe24AccessToken } from './utils';

export async function getSizeOptionFromItem(
  mallId: number,
  cafe24MallId: string,
  shopNo: number,
  productNo: number
): ServerActionResponse<{
  sizeOption: ProductOption | null;
}> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const response = await fetch(
      `https:/${cafe24MallId}.cafe24api.com/api/v2/admin/products/${productNo}/options?shop_no=${shopNo}`,
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

    const data = (await response.json()) as Cafe24GetProductOptionsResponse;

    if (data.option.has_option !== 'T') {
      // no option
      return {
        ok: true,
        data: {
          sizeOption: null,
        },
      };
    }

    const productdOptions: ProductOption[] = data.option.options.map((o) => ({
      optionName: o.option_name,
      optionValues: o.option_value.map((v) => ({
        optionText: v.option_text,
      })),
    }));

    const sizeOption = await extractSizeOption(productdOptions);

    if (!sizeOption) {
      throw new Error('No size option found');
    }

    return {
      ok: true,
      data: {
        sizeOption,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
