'use client';

import { env } from '@/env';
import { Button } from '@repo/design-system/components/ui/button';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function CopyLinkButton({ mallHash }: { mallHash: string }) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${env.NEXT_PUBLIC_SITE_URL}/external/reports/${mallHash}`
    );
    toast.success('링크가 복사되었습니다.');
  };

  return (
    <Button onClick={handleCopyLink} variant="outline">
      <CopyIcon />
      공유 링크
    </Button>
  );
}
