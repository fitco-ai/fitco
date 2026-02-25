'use server';

import { cafe24CartPageTable, database, eq } from '@repo/database';

export async function getCartPage(urlToken: string) {
  const cartPage = await database
    .select()
    .from(cafe24CartPageTable)
    .where(eq(cafe24CartPageTable.token, urlToken))
    .then((rows) => rows[0]);

  return cartPage?.url ?? null;
}
