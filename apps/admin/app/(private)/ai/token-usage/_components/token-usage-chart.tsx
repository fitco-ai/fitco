'use client';

import type { TimeUnit } from '@/actions/token-usage';
import LoadingSpinner from '@/components/loading-spinner';
import { useTokenUsageChartData } from '@/queries/ai-token-usage';
import { useAllMalls } from '@/queries/malls';
import { seoulDayjs } from '@/utils/date';
import { COMPARABLE_DATE_FORMAT } from '@/utils/formatters';
import { Button } from '@repo/design-system/components/ui/button';
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
import { Brain } from 'lucide-react';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// 최근 1달을 초기 범위로 설정
const getInitialDateRange = () => {
  const endDate = seoulDayjs().format(COMPARABLE_DATE_FORMAT).split(' ')[0];
  const startDate = seoulDayjs()
    .subtract(1, 'month')
    .format(COMPARABLE_DATE_FORMAT)
    .split(' ')[0];

  return {
    startDate,
    endDate,
  };
};

export default function TokenUsageChart() {
  const { data: malls } = useAllMalls();
  const [selectedMallId, setSelectedMallId] = useState<number>(-1);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('day');

  const [dateRange, setDateRange] = useState(getInitialDateRange());

  const { data: chartData, isLoading: isChartLoading } = useTokenUsageChartData(
    timeUnit,
    dateRange.startDate,
    dateRange.endDate,
    selectedMallId
  );

  const groups = chartData?.groups || [];
  const totalTokens = chartData?.totalTokens || 0;
  const avgTokensPerTimeUnit = chartData?.avgTokensPerTimeUnit || 0;

  // const { data: totalStats, isLoading: isTotalLoading } =
  //   useTokenUsageTotalInRange(
  //     dateRange.startDate,
  //     dateRange.endDate,
  //     selectedMallId
  //   );

  const handleTimeUnitChange = (value: string) => {
    setTimeUnit(value as TimeUnit);
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value,
    }));
  };

  const handleQuickRangeSelect = (months: number) => {
    const endDate = seoulDayjs().format(COMPARABLE_DATE_FORMAT).split(' ')[0];
    const startDate = seoulDayjs()
      .subtract(months, 'month')
      .format(COMPARABLE_DATE_FORMAT)
      .split(' ')[0];

    setDateRange({
      startDate,
      endDate,
    });
  };

  const getAverageTokenDescription = (unit: TimeUnit) => {
    switch (unit) {
      case 'day':
        return '1일당 평균';
      case 'week':
        return '1주당 평균';
      case 'month':
        return '1개월당 평균';
      case 'year':
        return '1년당 평균';
      default:
        return '회당 평균';
    }
  };

  const formatDateForDisplay = (dateStr: string, unit: TimeUnit) => {
    try {
      if (unit === 'week') {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) {
          return dateStr;
        }
        // 주의 시작일과 끝일을 표시
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        const startFormatted = `${date.getMonth() + 1}/${date.getDate()}`;
        const endFormatted = `${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
        return `${startFormatted}-${endFormatted}`;
      }
      if (unit === 'month') {
        const [year, month] = dateStr.split('-');
        return `${year}년 ${month}월`;
      }
      if (unit === 'year') {
        return `${dateStr}년`;
      }
      // day의 경우
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return dateStr;
    }
  };

  const formatDateForTooltip = (dateStr: string, unit: TimeUnit) => {
    try {
      if (unit === 'week') {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) {
          return dateStr;
        }
        // 주의 시작일과 끝일을 표시
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        const startFormatted = date.toLocaleDateString('ko-KR');
        const endFormatted = weekEnd.toLocaleDateString('ko-KR');
        return `${startFormatted} ~ ${endFormatted}`;
      }
      if (unit === 'month') {
        const [year, month] = dateStr.split('-');
        return `${year}년 ${month}월`;
      }
      if (unit === 'year') {
        return `${dateStr}년`;
      }
      // day의 경우
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      return dateStr;
    }
  };

  const data = chartData || [];

  if (!malls) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI 토큰 사용량 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mall 선택 */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">쇼핑몰: </span>
              <Select
                value={selectedMallId?.toString() || ''}
                onValueChange={(value) => setSelectedMallId(Number(value))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">전체</SelectItem>
                  {malls?.map((mall) => (
                    <SelectItem key={mall.id} value={mall.id.toString()}>
                      {mall.cafe24MallId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {/* 시간 단위 선택 */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">시간 단위:</span>
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

              {/* 날짜 범위 선택 */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">날짜 범위:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      handleDateRangeChange('start', e.target.value)
                    }
                    className="rounded border px-2 py-1 text-sm"
                  />
                  <span className="text-sm">~</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      handleDateRangeChange('end', e.target.value)
                    }
                    className="rounded border px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* 빠른 범위 선택 */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">빠른 선택:</span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRangeSelect(1)}
                    className="text-xs"
                  >
                    1개월
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRangeSelect(3)}
                    className="text-xs"
                  >
                    3개월
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRangeSelect(6)}
                    className="text-xs"
                  >
                    6개월
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRangeSelect(12)}
                    className="text-xs"
                  >
                    1년
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">총 토큰 사용량</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isChartLoading ? (
              <div className="flex h-20 items-center justify-center">
                <LoadingSpinner message="총 토큰 사용량을 계산하는 중..." />
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-1 font-bold text-3xl text-blue-600">
                  {totalTokens.toLocaleString()}
                </div>
                <div className="text-muted-foreground text-sm">
                  {dateRange.startDate} ~ {dateRange.endDate}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">평균 토큰</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isChartLoading ? (
              <div className="flex h-20 items-center justify-center">
                <LoadingSpinner message="평균 토큰을 계산하는 중..." />
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-1 font-bold text-3xl text-orange-600">
                  {Math.round(avgTokensPerTimeUnit).toLocaleString()}
                </div>
                <div className="text-muted-foreground text-sm">
                  {getAverageTokenDescription(timeUnit)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 메인 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>토큰 사용량 추이</CardTitle>
          <div className="text-muted-foreground text-sm">
            {timeUnit === 'day' && '일별'}
            {timeUnit === 'week' && '주별'}
            {timeUnit === 'month' && '월별'}
            {timeUnit === 'year' && '년별'} 토큰 사용량
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {isChartLoading && (
              <div className="flex h-full items-center justify-center">
                <LoadingSpinner message="차트 데이터를 불러오는 중..." />
              </div>
            )}
            {!isChartLoading && groups.length === 0 && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                선택된 기간에 데이터가 없습니다
              </div>
            )}
            {!isChartLoading && groups.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groups}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      formatDateForDisplay(value, timeUnit)
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    domain={[0, 'dataMax']}
                    allowDecimals={false}
                  />
                  <Tooltip
                    labelFormatter={(value) =>
                      formatDateForTooltip(value, timeUnit)
                    }
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      '토큰',
                    ]}
                  />
                  <Bar
                    dataKey="totalTokens"
                    fill="#3b82f6"
                    name="totalTokens"
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
