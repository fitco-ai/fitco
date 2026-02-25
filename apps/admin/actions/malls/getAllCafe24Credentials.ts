'use server';

import { cafe24CredentialTable, database } from '@repo/database';

export async function getAllCafe24Credentials() {
  return await database.select().from(cafe24CredentialTable);
}
