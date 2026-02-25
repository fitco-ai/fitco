'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { TestTube } from 'lucide-react';

export default function TestForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-orange-600" />
          프롬프트 테스트
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          현재 설정된 프롬프트로 예시 데이터를 테스트해보세요.
        </p>
      </CardHeader>
      <CardContent>123</CardContent>
    </Card>
  );
}
