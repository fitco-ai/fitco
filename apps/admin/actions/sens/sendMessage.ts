import { env } from '@/env';
import { seoulDayjs } from '@/utils/date';
import 'server-only';
import type { ServerActionResponse } from '@/types';
import { database, eq, signInCodeTable } from '@repo/database';
import { makeNaverCloudSignature } from '../../app/api/_utils';

export async function sendMessage(
  phone: string,
  code: string
): ServerActionResponse<null> {
  try {
    const base = 'https://sens.apigw.ntruss.com';
    const path = `/sms/v2/services/${env.NAVER_SENS_SERVICE_ID}/messages`;
    const url = `${base}${path}`;
    const timestamp = seoulDayjs().toDate().getTime();

    const signature = makeNaverCloudSignature('POST', path, timestamp);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ncp-apigw-timestamp': timestamp.toString(),
        'x-ncp-iam-access-key': env.NAVER_CLOUD_ACCESS_KEY_ID,
        'x-ncp-apigw-signature-v2': signature,
      },
      body: JSON.stringify({
        type: 'SMS',
        from: env.NAVER_SENS_CALLING_PHONE,
        content: `[${code}] Fitcoai 인증번호를 입력해주세요.`,
        messages: [
          {
            to: phone,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok || data.statusCode !== '202') {
      await database
        .delete(signInCodeTable)
        .where(eq(signInCodeTable.phone, phone));
      throw new Error('Failed to send message', data);
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
