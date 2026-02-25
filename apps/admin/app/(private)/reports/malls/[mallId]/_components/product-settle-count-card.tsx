'use client';
import LoadingSpinner from '@/components/loading-spinner';
import { useProductCountByMallId } from '@/queries/dashboard';
import { useMall } from '@/queries/malls';
import { useSettleCount } from '@/queries/salesvolume';
import type { ComparePeriod } from '@/types';
import { seoulDayjs } from '@/utils/date';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMallReportContext } from '../_context';

export function ProductSettleCountCard({ mallId }: { mallId: number }) {
  const [period, setPeriod] = useState<ComparePeriod>('1m');
  const { selectedShopNo } = useMallReportContext();
  const { data: settle, isLoading } = useSettleCount(
    mallId,
    selectedShopNo,
    period
  );
  const { data: productCount } = useProductCountByMallId(
    mallId,
    selectedShopNo
  );
  const totalCount = productCount?.totalCount;
  const { data: mall } = useMall(mallId);

  const chartData = useMemo(() => {
    if (!settle) {
      return [
        { period: '설치 전', rate: 0 },
        { period: '설치 후', rate: 0 },
      ];
    }
    return [
      { period: '설치 전', rate: settle.before.total },
      { period: '설치 후', rate: settle.after.total },
    ];
  }, [settle]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              앱 설치 전/후 정산 건수 비율{' '}
              {totalCount !== undefined && `[${totalCount}개 상품]`}
            </CardTitle>
            <div className="mt-1 text-muted-foreground text-sm">
              설치일: {seoulDayjs(mall?.createdAt).format('YYYY-MM-DD')}
            </div>
          </div>
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as ComparePeriod)}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1개월</SelectItem>
              <SelectItem value="3m">3개월</SelectItem>
              <SelectItem value="6m">6개월</SelectItem>
              <SelectItem value="1y">1년</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <LoadingSpinner message="정산 데이터를 불러오는 중..." />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                  domain={[0, 'dataMax + 10']}
                />
                <Tooltip
                  formatter={(v: number) => [v, '정산 건수']}
                  labelFormatter={(d) => d}
                />
                <Bar dataKey="rate" fill="#10B981" maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
