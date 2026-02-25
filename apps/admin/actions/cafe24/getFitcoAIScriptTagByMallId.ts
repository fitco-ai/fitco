'use server';

import { env } from '@/env';
import type {
  Cafe24GetAllMallScriptTagsResponse,
  ServerActionResponse,
} from '@/types';
import type { ScriptTag } from '@/types';
import { seoulDayjs } from '@/utils/date';
import { resolveCafe24AccessToken, resolveCafe24MallId } from './utils';

export async function getFitcoAIScriptTagByMallId(
  mallId: number,
  shopNo: number
): ServerActionResponse<{ fitcoAIScriptTag: ScriptTag | null }> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/scripttags?shop_no=${shopNo}`,
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

    const data = (await response.json()) as Cafe24GetAllMallScriptTagsResponse;

    const target = data.scripttags.find(
      (scriptTag) => scriptTag.src === env.NEXT_PUBLIC_WIDGET_SRC
    );

    if (!target) {
      return {
        ok: true,
        data: {
          fitcoAIScriptTag: null,
        },
      };
    }

    return {
      ok: true,
      data: {
        fitcoAIScriptTag: {
          src: target.src,
          shopNo: target.shop_no,
          scriptNo: target.script_no,
          displayLocation: target.display_location,
          skinNo: target.skin_no,
          excludePath: target.exclude_path,
          integrity: target.integrity,
          createdDate: seoulDayjs(target.created_date).toDate(),
          updatedDate: seoulDayjs(target.updated_date).toDate(),
        },
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
