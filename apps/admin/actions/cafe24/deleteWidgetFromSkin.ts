'use server';

import { env } from '@/env';
import type {
  Cafe24GetScriptTagResponse,
  ScriptTag,
  ServerActionResponse,
} from '@/types';
import { seoulDayjs } from '@/utils/date';
import { resolveCafe24AccessToken, resolveCafe24MallId } from './utils';

export async function deleteWidgetFromSkin(
  mallId: number,
  shopNo: number,
  skinNo: number,
  scriptNo: string
): ServerActionResponse<{ isDeleted?: boolean; isNotFound?: boolean }> {
  try {
    const scriptTag = await getScriptTag(mallId, shopNo, scriptNo);

    if (!scriptTag) {
      return {
        ok: true,
        data: {
          isNotFound: true,
        },
      };
    }

    if (scriptTag.skinNo.length === 1) {
      const response = await deleteScriptTag(mallId, shopNo, scriptNo);

      if (!response) {
        return {
          ok: false,
        };
      }
      return {
        ok: true,
        data: {
          isDeleted: true,
        },
      };
    }

    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);

    const payload = {
      shop_no: shopNo,
      request: {
        skin_no: scriptTag.skinNo
          .filter((no) => no !== skinNo.toString())
          .map((no) => Number(no)),
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
      if (error.error.code === 404) {
        return {
          ok: true,
          data: {
            isNotFound: true,
          },
        };
      }
      throw new Error(JSON.stringify(error));
    }

    return {
      ok: true,
      data: {
        isDeleted: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}

async function getScriptTag(
  mallId: number,
  shopNo: number,
  scriptNo: string
): Promise<ScriptTag | null> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/scripttags/${scriptNo}?shop_no=${shopNo}`,
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

    const data = (await response.json()) as Cafe24GetScriptTagResponse;

    return {
      shopNo: data.scripttag.shop_no,
      scriptNo: data.scripttag.script_no,
      src: data.scripttag.src,
      displayLocation: data.scripttag.display_location,
      skinNo: data.scripttag.skin_no,
      excludePath: data.scripttag.exclude_path,
      integrity: data.scripttag.integrity,
      createdDate: seoulDayjs(data.scripttag.created_date).toDate(),
      updatedDate: seoulDayjs(data.scripttag.updated_date).toDate(),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function deleteScriptTag(
  mallId: number,
  shopNo: number,
  scriptNo: string
): Promise<boolean> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/scripttags/${scriptNo}?shop_no=${shopNo}`,
      {
        method: 'DELETE',
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

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
