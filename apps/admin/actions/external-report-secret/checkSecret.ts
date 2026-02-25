'use server';

import type { ServerActionResponse } from '@/types';
import { database, eq, externalReportSecretTable } from '@repo/database';

export async function checkSecret(
  mallId: number,
  secret: string
): ServerActionResponse<{ isAuthorized: boolean }> {
  try {
    const result = await database
      .select()
      .from(externalReportSecretTable)
      .where(eq(externalReportSecretTable.mallId, mallId))
      .then((result) => result[0]);

    if (!result) {
      throw new Error('Invalid secret');
    }

    return {
      ok: true,
      data: {
        isAuthorized: result.secret === secret,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
