'use client';

import { useMember } from '@/queries/members';
import { seoulDayjs } from '@/utils/date';
import { Formatters } from '@/utils/formatters';
import { MEMBER_GENDERS } from '@repo/database/src/const';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function MemberInfo({ memberId }: { memberId: number }) {
  const { data: member } = useMember(memberId);

  if (!member) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  const { loginPhone, createdAt, gender, height, onboarding, weight } = member;

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-muted-foreground text-sm">전화번호</p>
              <p className="font-medium">{loginPhone ?? '비회원'}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">가입일</p>
            <p className="font-medium">
              {Formatters.date.korYmd(seoulDayjs(createdAt).toDate())}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>추가 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <p className="text-muted-foreground text-sm">성별</p>
              <p className="font-medium">
                {gender
                  ? MEMBER_GENDERS.find((g) => g.value === gender)?.label
                  : '미입력'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">키(cm)</p>
              <p className="font-medium">{height ?? '미입력'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">체중(kg)</p>
              <p className="font-medium">{weight ?? '미입력'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>온보딩 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-muted-foreground text-sm">온보딩 완료</p>
            <p className="font-medium">{onboarding ? '미완료' : '완료'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
