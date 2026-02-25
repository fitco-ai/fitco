import 'server-only';
import type { ServerActionResponse } from '@/types';
import type { RequestLoginCodeRequest } from '@/types/widget-request';
import { database, signInCodeTable } from '@repo/database';
import { customAlphabet } from 'nanoid';
import { sendMessage } from '../sens/sendMessage';

const alphabet = '0123456789';
const phoneLoginCodeToken = customAlphabet(alphabet, 6);

export async function requestSignInCode({
  phone,
}: RequestLoginCodeRequest): ServerActionResponse<null> {
  try {
    const code = phoneLoginCodeToken();
    await database.insert(signInCodeTable).values({
      phone,
      code,
    });
    const sendMessageResponse = await sendMessage(phone, code);

    if (!sendMessageResponse.ok) {
      throw new Error('Failed to send message');
    }

    return {
      ok: true,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
