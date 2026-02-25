'use client';

import LoadingSpinner from '@/components/loading-spinner';
import { useResultAnalyticsByMallId } from '@/queries/dashboard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Minus, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useMallReportContext } from '../_context';

export function ResultRateCard({ mallId }: { mallId: number }) {
  const { selectedShopNo } = useMallReportContext();
  const { data, isLoading } = useResultAnalyticsByMallId(
    mallId,
    selectedShopNo
  );

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            추천 사용률
          </CardTitle>
          <div className="text-muted-foreground text-sm">
            상세페이지 접속 당 사이즈를 추천받은 횟수입니다
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <LoadingSpinner message="추천 사용률 데이터를 불러오는 중..." />
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
            <Target className="h-5 w-5 text-purple-600" />
            추천 사용률
          </CardTitle>
          <div className="text-muted-foreground text-sm">
            상세페이지 접속 당 사이즈를 추천받은 횟수입니다
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground">
              추천 사용률 데이터가 없습니다
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalCount, resultCount, overallResultRate, changeRate, changeType } =
    data;

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeText = () => {
    switch (changeType) {
      case 'increase':
        return `+${changeRate}%`;
      case 'decrease':
        return `-${changeRate}%`;
      default:
        return '변화 없음';
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <Target className="h-4 w-4 text-purple-600" />
          </div>
          추천 사용률
        </CardTitle>
        <div className="text-muted-foreground text-xs">
          사이즈를 추천받은 횟수입니다
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex h-full flex-col justify-between gap-3">
          {/* 메인 추천 사용률 */}
          <div className="text-center">
            <div className="mb-2 font-bold text-5xl text-purple-600">
              {overallResultRate.toFixed(1)}%
            </div>
            <div className="font-medium text-muted-foreground text-sm">
              전체 추천 사용률
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-purple-50 p-3 text-center">
                <div className="font-bold text-lg text-purple-700">
                  {resultCount.toLocaleString()}
                </div>
                <div className="font-medium text-purple-600 text-xs">
                  추천받은 수
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="font-bold text-gray-700 text-lg">
                  {totalCount.toLocaleString()}
                </div>
                <div className="font-medium text-gray-600 text-xs">위젯 뷰</div>
              </div>
            </div>
          </div>

          {/* 변화율 */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-center space-x-2">
              {getChangeIcon()}
              <span className={`font-medium text-sm ${getChangeColor()}`}>
                {getChangeText()}
              </span>
            </div>
            <div className="mt-1 text-center text-muted-foreground text-xs">
              최근 1주일 vs 이전 1주일
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
