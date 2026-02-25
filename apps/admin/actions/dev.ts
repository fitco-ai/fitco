'use server';

import { env } from '@/env';
import {
  database,
  resetDatabase,
  userPasswordTable,
  userTable,
} from '@repo/database';

import bcrypt from 'bcryptjs';
import { resolveCafe24AccessToken, resolveCafe24MallId } from './cafe24/utils';

export async function resetDatabaseWithDrizzle() {
  await resetDatabase();
  await createAdminUser();
  console.log('Reset completed');
}

export async function createAdminUser() {
  const [user] = await database
    .insert(userTable)
    .values({
      login: 'admin',
    })
    .returning();

  await database.insert(userPasswordTable).values({
    userId: user.id,
    password: await bcrypt.hash('12121212', 10),
  });
}

export async function deleteScriptTag(
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
