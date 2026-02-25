'use client';

import type { TimeUnit } from '@/actions/dashboard/mall-chart';
import LoadingSpinner from '@/components/loading-spinner';
import { useMallChartData, useMallTotalCount } from '@/queries/dashboard';
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
import { useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function MallChartCard() {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('day');

  const { data: chartData, isLoading: isChartLoading } =
    useMallChartData(timeUnit);
  const { data: totalMalls, isLoading: isTotalLoading } = useMallTotalCount();

  const isLoading = isChartLoading || isTotalLoading;

  const handleTimeUnitChange = (value: string) => {
    setTimeUnit(value as TimeUnit);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>가입 쇼핑몰</CardTitle>
            <Select value={timeUnit} onValueChange={handleTimeUnitChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">일</SelectItem>
                <SelectItem value="week">주</SelectItem>
                <SelectItem value="month">월</SelectItem>
                <SelectItem value="year">년</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner message="쇼핑몰 차트 데이터를 불러오는 중..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = chartData || [];
  const recentData = data.slice(-14); // 최근 14개 데이터 포인트

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>가입 쇼핑몰</CardTitle>
            <div className="text-muted-foreground text-sm">
              총 {totalMalls || 0}개 몰
            </div>
          </div>
          <Select value={timeUnit} onValueChange={handleTimeUnitChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">일</SelectItem>
              <SelectItem value="week">주</SelectItem>
              <SelectItem value="month">월</SelectItem>
              <SelectItem value="year">년</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (timeUnit === 'month') {
                      const [year, month] = value.split('-');
                      return `${month}월`;
                    }
                    if (timeUnit === 'year') {
                      // 년도만 추출하여 'YYYY년' 형식으로 표시
                      const year = value.split('-')[0];
                      return `${year}년`;
                    }
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={[0, 'dataMax']}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(value) => {
                    if (timeUnit === 'month') {
                      const [year, month] = value.split('-');
                      return `${year}년 ${month}월`;
                    }
                    if (timeUnit === 'year') {
                      return `${value}년`;
                    }
                    const date = new Date(value);
                    return date.toLocaleDateString('ko-KR');
                  }}
                  formatter={(value: number) => [value, '누적 몰 수']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              데이터가 없습니다
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
