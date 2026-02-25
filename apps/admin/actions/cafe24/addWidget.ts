'use server';

import { env } from '@/env';
import type { ServerActionResponse } from '@/types';
import { resolveCafe24AccessToken, resolveCafe24MallId } from './utils';

export async function addScriptTag(
  mallId: number,
  skinNo: number,
  shopNo: number
): ServerActionResponse<{ isAdded?: boolean; isExists?: boolean }> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const payload = {
      shop_no: shopNo,
      request: {
        src: env.NEXT_PUBLIC_WIDGET_SRC,
        display_location: ['PRODUCT_DETAIL'],
        skin_no: [skinNo],
        // [todo] integrity 마지막에
      },
    };

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/scripttags`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': env.CAFE24_API_VERSION,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (error.error.code === 422) {
        const appliedSkins = error.error.more_info.skin_no as string[];
        const appliedShopNo = error.error.more_info.shop_no as number;
        if (
          appliedSkins.includes(skinNo.toString()) &&
          appliedShopNo === shopNo
        ) {
          return {
            ok: true,
            data: {
              isExists: true,
            },
          };
        }
        const scriptNo = error.error.more_info.script_no as string;
        const newSkins = [
          ...appliedSkins.map((skinNo) => Number(skinNo)),
          skinNo,
        ];
        const isUpdated = await updateScriptTag(
          mallId,
          shopNo,
          scriptNo,
          newSkins
        );

        if (!isUpdated) {
          return {
            ok: false,
          };
        }

        return {
          ok: true,
          data: {
            isAdded: true,
          },
        };
      }
      throw new Error(JSON.stringify(error));
    }

    return {
      ok: true,
      data: {
        isAdded: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}

async function updateScriptTag(
  mallId: number,
  shopNo: number,
  scriptNo: string,
  newSkins: number[]
) {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const payload = {
      shop_no: shopNo,
      request: {
        skin_no: newSkins,
      },
    };

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/scripttags/${scriptNo}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': env.CAFE24_API_VERSION,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
