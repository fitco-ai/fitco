'use server';

import type { ServerActionResponse } from '@/types';
import { database, externalReportSecretTable } from '@repo/database';
import { IdCodec } from '../utils';

export async function updateSecret(
  mallHash: string,
  secret: string
): ServerActionResponse<{ isCreated: boolean }> {
  try {
    const mallId = IdCodec.mall.decode(mallHash);

    await database
      .insert(externalReportSecretTable)
      .values({
        mallId,
        secret,
      })
      .onConflictDoUpdate({
        target: [externalReportSecretTable.mallId],
        set: {
          secret,
        },
      });

    return {
      ok: true,
      data: {
        isCreated: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
