import { database, eq, signInCodeTable } from '@repo/database';
import 'server-only';

export async function deleteLoginCode(phone: string) {
  await database
    .delete(signInCodeTable)
    .where(eq(signInCodeTable.phone, phone));
}
