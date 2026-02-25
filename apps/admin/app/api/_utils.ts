import crypto from 'node:crypto';
import { env } from '@/env';
import type { MemberTokenData } from '@/types/widget-request';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

export function resolveMemberIdFromRequest(request: NextRequest): {
  memberId: number | null;
} {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return {
        memberId: null,
      };
    }

    const { id } = jwt.verify(token, env.WIDGET_JWT_SECRET) as MemberTokenData;

    return {
      memberId: id,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('토큰 만료');
    }

    return {
      memberId: null,
    };
  }
}

export const getHeaders = () => {
  return {
    'Access-Control-Allow-Origin': '*', // [todo]
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PATCH',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Accept, ngrok-skip-browser-warning',
    'Access-Control-Allow-Credentials': 'true',
  };
};

export function makeNaverCloudSignature(
  method: string,
  path: string,
  timestamp: number
) {
  const space = ' ';
  const newLine = '\n';
  const accessKey = env.NAVER_CLOUD_ACCESS_KEY_ID;
  const secretKey = env.NAVER_CLOUD_SECRET_KEY;

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(path);
  hmac.update(newLine);
  hmac.update(timestamp.toString());
  hmac.update(newLine);
  hmac.update(accessKey);

  return hmac.digest('base64');
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers
      .get('x-forwarded-for')
      ?.split(',')[0]
      ?.trim() || // 프록시나 CDN 뒤에서
    request.headers.get('x-real-ip') || // Vercel Edge 환경 등
    null // 찾지 못한 경우
  );
}
