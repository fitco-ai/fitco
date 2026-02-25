'use client';

import { useDomToImageDownload } from '@/hooks/use-dom-to-image-download';
import { seoulDayjs } from '@/utils/date';
import { Button } from '@repo/design-system/components/ui/button';

export default function Wrapper({
  children,
  cafe24MallId,
}: { children: React.ReactNode; cafe24MallId: string }) {
  const { imageDownloadRef, handleImageDownload } = useDomToImageDownload(
    `${cafe24MallId}-report-${seoulDayjs().format('YYYY-MM-DD')}.png`
  );

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Button onClick={handleImageDownload}>PDF 다운로드</Button>
      </div>
      <div ref={imageDownloadRef}>{children}</div>
    </div>
  );
}
