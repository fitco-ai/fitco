'use client';

import LoadingSpinner from '@/components/loading-spinner';
import { useAllProductCount } from '@/queries/dashboard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { ExternalLink, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function ProductCountCard() {
  const { data, isLoading } = useAllProductCount();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            상품 수
          </CardTitle>
          <div className="text-muted-foreground text-sm">
            fitcoai를 사용하여 수집된 상품의 개수입니다.
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <LoadingSpinner message="상품 수 데이터를 불러오는 중..." />
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
            <Package className="h-5 w-5" />
            상품 수
          </CardTitle>
          <div className="text-muted-foreground text-sm">
            fitcoai를 사용하여 수집된 상품의 개수입니다.
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground">
              상품 수 데이터가 없습니다
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalCount, externalCount, mallCount } = data;

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <Package className="h-4 w-4 text-indigo-600" />
          </div>
          상품 수
        </CardTitle>
        <div className="text-muted-foreground text-xs">
          fitcoai를 통해 수집된 상품의 개수입니다.
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex h-full flex-col justify-between gap-3">
          {/* 전체 상품 수 - 큰 숫자로 강조 */}
          <div className="text-center">
            <div className="mb-2 font-bold text-5xl text-indigo-600">
              {totalCount.toLocaleString()}
            </div>
            <div className="font-medium text-muted-foreground text-sm">
              전체 상품
            </div>
          </div>

          {/* 상품 분류 - 아이콘과 함께 표시 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-indigo-50 p-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-indigo-600" />
                <span className="font-medium text-gray-700 text-sm">
                  쇼핑몰 상품
                </span>
              </div>
              <Link
                href="/products/mall"
                className="font-bold text-indigo-700 text-xl underline"
              >
                {mallCount.toLocaleString()}
              </Link>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700 text-sm">
                  외부 상품
                </span>
              </div>
              <Link
                href="/products/external"
                className="font-bold text-gray-700 text-xl underline"
              >
                {externalCount.toLocaleString()}
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
