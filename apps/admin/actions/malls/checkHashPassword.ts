'use server';

import type { ServerActionResponse } from '@/types';
import { IdCodec } from '../utils';
import { getMallById } from './getMallById';

export async function checkHashPassword(
  password: string,
  mallHash: string
): ServerActionResponse<{ isValid: boolean }> {
  try {
    const mallId = IdCodec.mall.decode(mallHash);
    const mallResponse = await getMallById(mallId);
    const mall = mallResponse.data?.mall;

    if (!mall) {
      throw new Error('Mall not found');
    }

    return {
      ok: true,
      data: {
        isValid: password === mall.cafe24MallId,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
