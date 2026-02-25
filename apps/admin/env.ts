import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NEXTAUTH_SECRET: z.string().min(1),
    CAFE24_SECRET_KEY: z.string().min(1),
    CAFE24_API_VERSION: z.string().min(1),
    WIDGET_JWT_SECRET: z.string().min(1),
    NAVER_CLOUD_ACCESS_KEY_ID: z.string().min(1),
    NAVER_CLOUD_SECRET_KEY: z.string().min(1),
    NAVER_SENS_SERVICE_ID: z.string().min(1),
    NAVER_SENS_CALLING_PHONE: z.string().min(1),
    OPEN_AI_API_KEY: z.string().min(1),
    RECOMMENDATION_ID_HASH_SALT: z.string().min(1),
    MALL_ID_HASH_SALT: z.string().min(1),
    PPURIO_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_CAFE24_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_CAFE24_REDIRECT_URI: z.string().min(1),
    NEXT_PUBLIC_CAFE24_SCOPE: z.string().min(1),
    NEXT_PUBLIC_WIDGET_SRC: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CAFE24_CLIENT_ID: process.env.NEXT_PUBLIC_CAFE24_CLIENT_ID,
    NEXT_PUBLIC_CAFE24_REDIRECT_URI:
      process.env.NEXT_PUBLIC_CAFE24_REDIRECT_URI,
    NEXT_PUBLIC_CAFE24_SCOPE: process.env.NEXT_PUBLIC_CAFE24_SCOPE,
    NEXT_PUBLIC_WIDGET_SRC: process.env.NEXT_PUBLIC_WIDGET_SRC,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL, // for ngrok
  },
});
