'use client';

import LoadingSpinner from '@/components/loading-spinner';
import { useAllReviewCount } from '@/queries/dashboard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function ReviewCountCard() {
  const { data, isLoading } = useAllReviewCount();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            리뷰 수
          </CardTitle>
          <div className="text-muted-foreground text-sm">
            상품 사이즈에 대한 사용자의 리뷰입니다
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <LoadingSpinner message="리뷰 수 데이터를 불러오는 중..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            리뷰 수
          </CardTitle>
          <div className="text-muted-foreground text-sm">
            상품 사이즈에 대한 사용자의 리뷰입니다
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground">
              리뷰 수 데이터가 없습니다
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalCount } = data;

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <MessageSquare className="h-4 w-4 text-green-600" />
          </div>
          리뷰 수
        </CardTitle>
        <div className="text-muted-foreground text-xs">
          상품 사이즈에 대한 사용자의 리뷰 개수입니다.
        </div>
      </CardHeader>
      <CardContent className="h-[200px] pt-0">
        <div className="flex h-full flex-col justify-center">
          {/* 전체 리뷰 수 - 큰 숫자로 강조 */}
          <div className="text-center">
            <div className="mb-2 font-bold text-5xl text-green-600">
              <Link href="/reviews" className="underline">
                {totalCount.toLocaleString()}
              </Link>
            </div>
            <div className="font-medium text-muted-foreground text-sm">
              전체 리뷰
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
