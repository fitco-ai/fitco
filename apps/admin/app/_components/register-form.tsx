'use client';

import { createCodeState } from '@/actions/auth/createCodeState';
import LoadingSpinner from '@/components/loading-spinner';
import { env } from '@/env';
import { Button } from '@repo/design-system/components/ui/button';
import { nanoid } from 'nanoid';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function RegisterForm({
  cafe24MallId,
}: { cafe24MallId: string }) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const state = nanoid();
      const codeStateResponse = await createCodeState(cafe24MallId, state);
      if (!codeStateResponse.ok || !codeStateResponse.data?.isCreated) {
        toast.error('서버와의 통신 중 오류가 발생했습니다.');
        return;
      }
      const redirectUri = env.NEXT_PUBLIC_CAFE24_REDIRECT_URI;
      const scope = env.NEXT_PUBLIC_CAFE24_SCOPE;
      const href = `https://${cafe24MallId}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${env.NEXT_PUBLIC_CAFE24_CLIENT_ID}&state=${state}&redirect_uri=${redirectUri}&scope=${scope}`;
      setHref(href);
    };
    initialize();
  }, [cafe24MallId]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      {href ? (
        <>
          <Image
            src="/images/fitco_logo_204x101.png"
            width={204}
            height={101}
            alt="fitco"
            className="h-auto w-[102px]"
          />
          <Link href={href}>
            <Button variant="outline">API호출 권한동의</Button>
          </Link>
        </>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
}
