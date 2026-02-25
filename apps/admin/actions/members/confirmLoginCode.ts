import 'server-only';
import type { ServerActionResponse } from '@/types';
import type { SignInRequest, SignUpRequest } from '@/types/widget-request';
import { database, desc, eq, signInCodeTable } from '@repo/database';
import { deleteLoginCode } from './deleteLoginCode';

export async function confirmLoginCode({
  phone,
  code,
}: SignInRequest | SignUpRequest): ServerActionResponse<{ isValid: boolean }> {
  try {
    const signInCode = await database
      .select()
      .from(signInCodeTable)
      .where(eq(signInCodeTable.phone, phone))
      .orderBy(desc(signInCodeTable.id))
      .limit(1)
      .then((rows) => rows[0]);

    if (!signInCode) {
      throw new Error('Sign in code not found');
    }

    if (signInCode.code !== code) {
      throw new Error('Invalid code');
    }

    await deleteLoginCode(phone);

    return {
      ok: true,
      data: {
        isValid: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
