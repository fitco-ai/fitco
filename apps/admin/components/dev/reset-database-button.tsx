'use client';

import { resetDatabaseWithDrizzle } from '@/actions/dev';
import { Button } from '@repo/design-system/components/ui/button';

export default function ResetDatabaseButton() {
  return <Button onClick={() => resetDatabaseWithDrizzle()}>초기화</Button>;
}
