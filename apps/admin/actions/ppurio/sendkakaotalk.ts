'use server';

import { env } from '@/env';
import { seoulDayjs } from '@/utils/date';
import {
  createPpurioCredential,
  getPpurioCredential,
  updatePpurioCredential,
} from './utils';

const TIME_OUT = 5000;
const API_KEY = env.PPURIO_API_KEY;
const PPURIO_ACCOUNT = 'fitco';
const SENDER_PROFILE = '@fitco_ai';
// const TEMPLATE_CODE = 'ppur_2025092311405410479388721';
const TEMPLATE_CODE_BASE = 'ppur_2025101116341024390432963';
const TEMPLATE_CODE_COMPARE = 'ppur_2025101116371924390947987';
const URI = 'https://message.ppurio.com';

export type SendTarget = {
  type: 'base' | 'compare';
  to: string;
  changeWord: Record<string, string>;
};

/** 발송 예시 */
export async function requestSend(targets: SendTarget[]) {
  try {
    const basicAuthorization = base64Encode(`${PPURIO_ACCOUNT}:${API_KEY}`);
    const token = await resolveToken(URI, basicAuthorization);
    if (!token) {
      throw new Error('토큰 발급 실x패: token 없음');
    }

    const baseTargets: SendTarget[] = [];
    const compareTargets: SendTarget[] = [];

    for (const target of targets) {
      if (target.type === 'base') {
        baseTargets.push(target);
      } else {
        compareTargets.push(target);
      }
    }

    const baseSendRes = await sendAlt(
      URI,
      token,
      createBaseSendParams(baseTargets)
    );
    const compareSendRes = await sendAlt(
      URI,
      token,
      createCompareSendParams(compareTargets)
    );
    // if (sendRes.code === '1000') {
    //   await database.insert(cafe24CartPageTable).values({
    //     token: urlToken,
    //     url: sendRes.url,
    //   });
    // }

    console.log('[BASE SEND RESPONSE]', baseSendRes);
    console.log('[COMPARE SEND RESPONSE]', compareSendRes);
  } catch (error) {
    console.error(error);
  }
}

/** Base64 인코딩 */
function base64Encode(str: string) {
  return Buffer.from(str, 'utf-8').toString('base64');
}

/** fetch + AbortController로 타임아웃 적용 */
async function fetchWithTimeout(
  url: string,
  options = {},
  timeoutMs = TIME_OUT
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status} ${res.statusText}: ${JSON.stringify(data)}`
      );
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/** Access Token 발급 (24시간 유효) */
async function resolveToken(baseUri: string, basicAuthorization: string) {
  try {
    let credential = await getPpurioCredential();
    if (!credential) {
      const { token, expired } = await getToken(baseUri, basicAuthorization);
      credential = await createPpurioCredential(token, expired);
      return credential.accessToken;
    }

    const now = seoulDayjs().format('YYYYMMDDHHmmss');
    const expiredAt = credential.accessTokenExpiresAt;

    if (now < expiredAt) {
      return credential.accessToken;
    }

    const newToken = await getToken(baseUri, basicAuthorization);
    credential = await updatePpurioCredential(
      credential.id,
      newToken.token,
      newToken.expired
    );

    return credential.accessToken;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getToken(baseUri: string, basicAuthorization: string) {
  const tokenResponse = await fetchWithTimeout(`${baseUri}/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuthorization}`,
    },
  });
  const data = tokenResponse as {
    token: string;
    type: string;
    expired: string;
  }; // YYYYMMDDHHmmss};
  return { token: data.token, expired: data.expired };
}

/** 카카오(알림톡) 발송 */
function sendAlt(baseUri: string, accessToken: string, payload: any) {
  return fetchWithTimeout(`${baseUri}/v1/kakao`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

function createBaseSendParams(targets: SendTarget[]) {
  return {
    account: PPURIO_ACCOUNT,
    messageType: 'ALT',
    senderProfile: SENDER_PROFILE,
    templateCode: TEMPLATE_CODE_BASE,
    duplicateFlag: 'N',
    isResend: 'N',
    targetCount: targets.length,
    targets,
    refKey: randomString(32),
  };
}

function createCompareSendParams(targets: SendTarget[]) {
  return {
    account: PPURIO_ACCOUNT,
    messageType: 'ALT',
    senderProfile: SENDER_PROFILE,
    templateCode: TEMPLATE_CODE_COMPARE,
    duplicateFlag: 'N',
    isResend: 'N',
    targetCount: targets.length,
    targets,
    refKey: randomString(32),
  };
}

/** 영문/숫자 랜덤 문자열 */
function randomString(length: number) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}
