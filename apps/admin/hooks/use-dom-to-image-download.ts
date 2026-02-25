import { toPng } from 'html-to-image';
import { useCallback, useRef, useState } from 'react';

export function useDomToImageDownload(fileName: string) {
  const [loading, setLoading] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (downloadRef.current === null) {
      return;
    }
    setLoading(true);
    try {
      const dataURL = await toPng(downloadRef.current, {
        backgroundColor: '#fff',
      });
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [fileName]);

  return {
    imageDownloading: loading,
    imageDownloadRef: downloadRef,
    handleImageDownload: handleDownload,
  };
}
