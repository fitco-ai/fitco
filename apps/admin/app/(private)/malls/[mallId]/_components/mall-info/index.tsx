'use client';

import { useAllMallShops, useMall } from '@/queries/malls';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Separator } from '@repo/design-system/components/ui/separator';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { Building2, Calendar, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';

interface MallInfoProps {
  mallId: number;
}

export default function MallInfo({ mallId }: MallInfoProps) {
  const { data: mall, isLoading } = useMall(mallId);
  const { data: shops } = useAllMallShops(mallId);

  if (isLoading) {
    return <MallInfoSkeleton />;
  }

  if (!mall) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            쇼핑몰 정보를 찾을 수 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          쇼핑몰 기본정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 쇼핑몰 ID 및 상태 */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{mall.cafe24MallId}</h3>
            <p className="text-muted-foreground text-sm">Cafe24 쇼핑몰 ID</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            연동됨
          </Badge>
        </div>

        <Separator />

        {/* 쇼핑몰 URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">쇼핑몰 URL</span>
          </div>
          <ul className="space-y-1">
            {shops?.map((shop) => {
              const url = `https://${shop.baseDomain}`;
              return (
                <li key={shop.shopNo} className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    [{shop.shopName}] {url}
                  </span>
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <Separator />

        {/* 연동 정보 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">연동 정보</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs">연동일</p>
              <p className="font-medium text-sm">
                {new Date(mall.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">쇼핑몰 ID</p>
              <p className="font-medium text-sm">{mall.id}</p>
            </div>
          </div>
        </div>

        {/* 추가 정보 (향후 확장 가능) */}
        <Separator />

        <div className="space-y-2">
          <p className="font-medium text-sm">관리</p>
          <Link
            href={`/products/mall/${mall.id}`}
            className="text-sky-600 text-sm hover:underline"
          >
            상품조회
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function MallInfoSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <Separator />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Separator />
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
