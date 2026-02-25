'use server';

import { database, eq, memberProductTable } from '@repo/database';

export async function getMemberProducts(memberId: number) {
  try {
    return await database
      .select()
      .from(memberProductTable)
      .where(eq(memberProductTable.memberId, memberId));
  } catch (error) {
    console.error(error);
    return [];
  }
}
