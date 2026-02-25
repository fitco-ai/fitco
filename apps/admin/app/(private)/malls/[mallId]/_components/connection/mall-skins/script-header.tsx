import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@repo/design-system/components/ui/hover-card';
import { LucideMessageCircleQuestion } from 'lucide-react';

export default function ScriptHeader() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-1">
          <span>위젯</span>
          <LucideMessageCircleQuestion className="size-5" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 text-sm">
        위젯 추가/해제 시 적용까지 최대 1분 소요됩니다. 새로고침 후 확인해
        주세요.
      </HoverCardContent>
    </HoverCard>
  );
}
