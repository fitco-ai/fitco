'use server';

import {
  type SelectPpurioCredential,
  database,
  eq,
  ppurioCredentialTable,
} from '@repo/database';

export async function getPpurioCredential() {
  const credentials = await database.select().from(ppurioCredentialTable);

  if (credentials.length === 0) {
    return null;
  }

  return credentials[0];
}

export async function createPpurioCredential(
  token: string,
  expiredAt: string
): Promise<SelectPpurioCredential> {
  const credentail = await database
    .insert(ppurioCredentialTable)
    .values({
      accessToken: token,
      accessTokenExpiresAt: expiredAt,
    })
    .returning()
    .then((rows) => rows[0]);

  return credentail;
}

export async function updatePpurioCredential(
  id: number,
  token: string,
  expiredAt: string
) {
  const credential = await database
    .update(ppurioCredentialTable)
    .set({
      accessToken: token,
      accessTokenExpiresAt: expiredAt,
    })
    .where(eq(ppurioCredentialTable.id, id))
    .returning()
    .then((rows) => rows[0]);

  return credential;
}
