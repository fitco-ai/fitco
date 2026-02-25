'use server';

import { env } from '@/env';
import type {
  Cafe24GetAllMallSkinsResponse,
  ServerActionResponse,
} from '@/types';
import type { Skin, SkinDevice } from '@/types';
import { resolveCafe24AccessToken, resolveCafe24MallId } from './utils';

export async function getAllMallSkinsByMallId(
  mallId: number
): ServerActionResponse<{ skins: Skin[] }> {
  try {
    const result = await Promise.all([
      fetchSkins(mallId, 'pc'),
      fetchSkins(mallId, 'mobile'),
    ]);

    return {
      ok: true,
      data: {
        skins: result.flat(),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}

async function fetchSkins(mallId: number, device: SkinDevice): Promise<Skin[]> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/themes?type=${device}`,
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

    const data = (await response.json()) as Cafe24GetAllMallSkinsResponse;

    return data.themes.map((theme) => ({
      skinNo: theme.skin_no,
      skinCode: theme.skin_code,
      skinName: theme.skin_name,
      skinThumbnailUrl: theme.skin_thumbnail_url,
      publishedIn: theme.published_in,
      device,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
