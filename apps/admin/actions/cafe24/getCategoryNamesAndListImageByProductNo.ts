'use server';

import { env } from '@/env';
import type {
  Cafe24GetCategoriesResponse,
  Cafe24GetProductResponse,
  ServerActionResponse,
} from '@/types';
import _ from 'lodash';
import { resolveCafe24AccessToken } from './utils';

export async function getCategoryNamesAndListImageByProductNo(
  mallId: number,
  cafe24MallId: string,
  shopNo: number,
  productNo: number
): ServerActionResponse<{
  categoryNames: string[] | null;
  listImage: string | null;
}> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const categoryResponse = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/categories?shop_no=${shopNo}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': env.CAFE24_API_VERSION,
        },
      }
    );

    if (!categoryResponse.ok) {
      const error = await categoryResponse.json();
      throw new Error(JSON.stringify(error));
    }

    const categoriesData =
      (await categoryResponse.json()) as Cafe24GetCategoriesResponse;
    const categoryMap = _.keyBy(categoriesData.categories, 'category_no');

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/products/${productNo}?shop_no=${shopNo}`,
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

    const data = (await response.json()) as Cafe24GetProductResponse;

    const listImage = data.product.list_image;
    const categoryNos = data.product.category.map(
      (category) => category.category_no
    );

    const categoryNames: string[] = [];
    for (const no of categoryNos) {
      if (categoryMap[String(no)]) {
        const fullCategoryName = categoryMap[String(no)].full_category_name;
        const merged = _.values(fullCategoryName)
          .filter((v) => !!v)
          .join('/');
        categoryNames.push(merged);
      }
    }

    return {
      ok: true,
      data: {
        categoryNames,
        listImage,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
