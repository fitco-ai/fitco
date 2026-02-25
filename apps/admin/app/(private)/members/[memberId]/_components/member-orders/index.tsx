'use client';

import { useMemberOrders } from '@/queries/orders';
import { resolveProductHref } from '@/utils/common';
import { Formatters } from '@/utils/formatters';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {} from '@repo/design-system/components/ui/dialog';
import { Separator } from '@repo/design-system/components/ui/separator';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { cn } from '@repo/design-system/lib/utils';
import { MessageSquare, Package, Ruler, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ReviewActions from './review-actions';

export default function MemberOrders({ memberId }: { memberId: number }) {
  const { data: memberOrders } = useMemberOrders(memberId);

  if (!memberOrders) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (memberOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            구매/리뷰 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            구매 내역이 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            구매/리뷰 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memberOrders.map((orderHistory, index) => {
              const productUrl = resolveProductHref(
                orderHistory.product.mallId,
                orderHistory.product.id
              );
              return (
                <div key={orderHistory.order.id}>
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                        {/* 상품 이미지 */}
                        <Link className="flex-shrink-0" href={productUrl}>
                          {orderHistory.product.productImage ? (
                            <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                              <Image
                                src={orderHistory.product.productImage}
                                alt={
                                  orderHistory.product.productName ||
                                  '상품 이미지'
                                }
                                fill
                                className="object-contain"
                                sizes="80px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </Link>

                        {/* 상품 정보 */}
                        <div className="flex-1 space-y-3">
                          {/* 상품명과 주문일 */}
                          <div className="space-y-1">
                            <h3 className="font-semibold">
                              <Link href={productUrl}>
                                {orderHistory.product.productName ||
                                  '상품명 없음'}
                              </Link>
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              주문일:{' '}
                              {Formatters.date.korYmd(
                                orderHistory.order.orderDate
                              )}
                            </p>
                          </div>

                          {/* 사이즈 정보 */}
                          <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="secondary" className="text-xs">
                              {orderHistory.spec.size}
                            </Badge>
                          </div>

                          {/* 리뷰 정보 */}
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span className="font-medium text-sm">
                                  리뷰
                                </span>
                              </div>
                              {orderHistory.review && (
                                <ReviewActions
                                  memberId={memberId}
                                  initialContent={orderHistory.review.content}
                                  specId={orderHistory.spec.id}
                                  reviewId={orderHistory.review.id}
                                />
                              )}
                            </div>
                            <p
                              className={cn(
                                'rounded-lg p-4 font-medium text-sm',
                                orderHistory.review?.content
                                  ? 'bg-muted/75'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {orderHistory.review?.content ?? '리뷰 없음'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 구분선 (마지막 항목 제외) */}
                  {index < memberOrders.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
