'use client';

import { Button } from '@repo/design-system/components/ui/button';

export default function ManualCollectionButton() {
  const handleClick = () => {
    fetch('/api/collection');
  };

  return <Button onClick={handleClick}>수집</Button>;
}
