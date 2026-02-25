'use client';
import { useWidgetExitViewsByMallId } from '@/queries/dashboard';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { TrendingDown } from 'lucide-react';
import {
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useExternalMallReportContext } from '../_context';

// 차트 색상 정의
const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
];

// 위젯 뷰 이름을 한글로 변환
const getViewDisplayName = (view: string): string => {
  const viewNames: Record<string, string> = {
    none: '없음',
    'login-methods': '로그인 선택',
    'login-phone': '전화번호 로그인',
    'onboarding-intro': '인트로 소개',
    'onboarding-form': '회원가입 폼',
    'result-summary': '결과 요약',
    'result-detail': '결과 상세',
    'order-list': '주문 목록',
    mypage: '마이페이지',
    'promote-member': '회원가입 유도',
  };
  return viewNames[view] || view;
};

export function ExitPageCard({ mallId }: { mallId: number }) {
  const { selectedShopNo } = useExternalMallReportContext();
  const { data: exitViews, isLoading } = useWidgetExitViewsByMallId(
    mallId,
    selectedShopNo
  );

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            이탈 페이지 분석
          </CardTitle>
          <CardDescription>
            사용자들이 어느 단계에서 이탈하는지 분석합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!exitViews || exitViews.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            이탈 페이지 분석
          </CardTitle>
          <CardDescription>
            사용자들이 어느 단계에서 이탈하는지 분석합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  // 차트 데이터 준비
  const chartData = exitViews.map((item, index) => ({
    name: getViewDisplayName(item.view),
    value: item.count,
    fill: COLORS[index % COLORS.length],
    originalView: item.view,
  }));

  // 총 이탈 수 계산
  const totalExits = exitViews.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-500" />
          이탈 페이지 분석
        </CardTitle>
        <CardDescription>
          사용자들이 어느 단계에서 이탈하는지 분석합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 차트 */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <div className="font-medium text-foreground">
                          {data.name}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          이탈 수:{' '}
                          <span className="font-semibold text-foreground">
                            {data.value}회
                          </span>
                        </div>
                        <div className="text-muted-foreground text-sm">
                          비율:{' '}
                          <span className="font-semibold text-foreground">
                            {((data.value / totalExits) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="name"
                  position="outside"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 범례 */}
        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm">
            상세 정보
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {chartData.map((item, index) => (
              <div
                key={item.originalView}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.value}회
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {((item.value / totalExits) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
