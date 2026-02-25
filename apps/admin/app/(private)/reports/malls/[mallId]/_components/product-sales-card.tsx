'use client';

import { useMallProducts } from '@/queries/product';
import { useCafe24ProductSales } from '@/queries/product-sales';
import { seoulDayjs } from '@/utils/date';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Calendar as CalendarComponent } from '@repo/design-system/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { cn } from '@repo/design-system/lib/utils';
import { ko } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useMallReportContext } from '../_context';

export default function ProductSalesCard({ mallId }: { mallId: number }) {
  const { selectedShopNo } = useMallReportContext();
  const { data: mallProducts } = useMallProducts(mallId);

  const mallProductMap = useMemo(() => {
    if (!mallProducts) {
      return {};
    }
    return mallProducts.reduce(
      (acc, product) => {
        acc[product.productNo] = product;
        return acc;
      },
      {} as Record<number, (typeof mallProducts)[number]>
    );
  }, [mallProducts]);

  const [startDate, setStartDate] = useState<Date | undefined>(
    seoulDayjs().subtract(90, 'day').toDate()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    seoulDayjs().toDate()
  );
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  // 날짜 범위 검증 (최대 3개월)
  const isValidDateRange = useMemo(() => {
    if (!startDate || !endDate) {
      return false;
    }
    const diffInDays = seoulDayjs(endDate).diff(seoulDayjs(startDate), 'day');
    return diffInDays >= 0 && diffInDays <= 90; // 3개월 = 90일
  }, [startDate, endDate]);

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const startDateString = startDate
    ? seoulDayjs(startDate).format('YYYY-MM-DD')
    : '';
  const endDateString = endDate ? seoulDayjs(endDate).format('YYYY-MM-DD') : '';

  const {
    data: productSales,
    isLoading,
    error,
  } = useCafe24ProductSales(
    mallId,
    selectedShopNo,
    startDateString,
    endDateString
  );

  // order_amount 합계 계산
  const totalOrderAmount = useMemo(() => {
    if (!productSales) {
      return 0;
    }
    return productSales.reduce((sum, item) => sum + item.order_amount, 0);
  }, [productSales]);

  // 총 주문 수 계산
  const totalOrderCount = useMemo(() => {
    if (!productSales) {
      return 0;
    }
    return productSales.reduce((sum, item) => sum + item.order_count, 0);
  }, [productSales]);

  // 총 주문 상품 수 계산
  const totalOrderProductCount = useMemo(() => {
    if (!productSales) {
      return 0;
    }
    return productSales.reduce(
      (sum, item) => sum + item.order_product_count,
      0
    );
  }, [productSales]);

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            쇼핑몰 매출 조회
          </CardTitle>
          <CardDescription>
            선택한 기간의 쇼핑몰 매출을 조회합니다(최대 3개월)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-destructive">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          쇼핑몰 매출 조회
        </CardTitle>
        <CardDescription>
          선택한 기간의 쇼핑몰 매출을 조회합니다(최대 3개월)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 날짜 선택 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="start-date" className="font-medium text-sm">
              시작 날짜
            </label>
            <Popover
              open={isStartCalendarOpen}
              onOpenChange={setIsStartCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate
                    ? seoulDayjs(startDate).format('YYYY년 MM월 DD일')
                    : '날짜 선택'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setIsStartCalendarOpen(false);
                  }}
                  disabled={(date) =>
                    seoulDayjs(date).isAfter(seoulDayjs()) ||
                    seoulDayjs(date).isBefore(seoulDayjs('1900-01-01'))
                  }
                  locale={ko}
                  defaultMonth={startDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label htmlFor="end-date" className="font-medium text-sm">
              종료 날짜
            </label>
            <Popover
              open={isEndCalendarOpen}
              onOpenChange={setIsEndCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate
                    ? seoulDayjs(endDate).format('YYYY년 MM월 DD일')
                    : '날짜 선택'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setIsEndCalendarOpen(false);
                  }}
                  disabled={(date) => {
                    if (seoulDayjs(date).isAfter(seoulDayjs())) {
                      return true;
                    }
                    if (seoulDayjs(date).isBefore(seoulDayjs('1900-01-01'))) {
                      return true;
                    }
                    if (
                      startDate &&
                      seoulDayjs(date).isBefore(seoulDayjs(startDate))
                    ) {
                      return true;
                    }
                    return false;
                  }}
                  locale={ko}
                  defaultMonth={endDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 날짜 범위 검증 메시지 */}
        {startDate && endDate && !isValidDateRange && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-amber-800 text-sm">
              날짜 범위는 최대 3개월(90일)까지 선택할 수 있습니다.
            </p>
          </div>
        )}

        {/* 매출 데이터 */}
        {(() => {
          if (isLoading) {
            return (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            );
          }

          if (startDate && endDate && isValidDateRange) {
            return (
              <div className="space-y-4">
                {/* 요약 정보 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <div className="text-muted-foreground text-sm">
                      총 매출액
                    </div>
                    <div className="font-bold text-2xl text-green-600">
                      {totalOrderAmount.toLocaleString()}원
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-muted-foreground text-sm">
                      총 주문 수
                    </div>
                    <div className="font-bold text-2xl text-blue-600">
                      {totalOrderCount.toLocaleString()}건
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-muted-foreground text-sm">
                      총 주문 상품 수
                    </div>
                    <div className="font-bold text-2xl text-purple-600">
                      {totalOrderProductCount.toLocaleString()}개
                    </div>
                  </div>
                </div>

                {/* 제품별 매출 상세 */}
                {productSales && productSales.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-muted-foreground text-sm">
                      제품별 매출 상세
                    </h4>
                    <div className="max-h-[300px] space-y-2 overflow-y-auto">
                      {productSales.map((item, index) => {
                        const isMallProduct = !!mallProductMap[item.product_no];
                        return (
                          <div
                            key={`${item.product_no}-${index}`}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex flex-1 gap-2">
                              <div>
                                <div className="font-medium text-sm">
                                  {item.product_name}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  제품번호: {item.product_no}
                                </div>
                              </div>
                              {isMallProduct && (
                                <Image
                                  src="/images/fitco_logo_204x101.png"
                                  alt="Fitco"
                                  width={204}
                                  height={101}
                                  className="h-auto w-[50px]"
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.order_count}건
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.order_product_count}개
                              </Badge>
                              <div className="text-right">
                                <div className="font-semibold text-sm">
                                  {item.order_amount.toLocaleString()}원
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                    선택한 기간에 매출 데이터가 없습니다.
                  </div>
                )}
              </div>
            );
          }

          return (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              시작 날짜와 종료 날짜를 선택해주세요.
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
