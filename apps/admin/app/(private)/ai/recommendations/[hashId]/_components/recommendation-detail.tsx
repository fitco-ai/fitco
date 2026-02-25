'use client';

import { useRecommendationDetail } from '@/queries/recommendations';
import type { SizeResult } from '@/types/widget-request';
import { resolveProductHref } from '@/utils/common';
import { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Separator } from '@repo/design-system/components/ui/separator';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import {
  Building2,
  Calendar,
  CheckCircle,
  Globe,
  Heart,
  Package,
  Ruler,
  Star,
  User,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RecommendationDetail({
  recommendationId,
}: {
  recommendationId: number;
}) {
  const { data: recommendation, isLoading } =
    useRecommendationDetail(recommendationId);

  if (isLoading) {
    return <RecommendationDetailSkeleton />;
  }

  if (!recommendation) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            추천 정보를 찾을 수 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    recommendation: rec,
    mall,
    member,
    product,
    productSpecification,
  } = recommendation;
  const sizeResults = rec.sizeResults as SizeResult[] | null;

  return (
    <div className="space-y-6">
      {/* 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI 사이즈 추천 분석
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* 쇼핑몰 정보 */}
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">쇼핑몰</p>
                <p className="text-muted-foreground text-xs">
                  <Link
                    href={`/malls/${mall.id}`}
                    className="text-sky-600 hover:underline"
                  >
                    {mall.cafe24MallId}
                  </Link>
                </p>
              </div>
            </div>

            {/* 사용자 정보 */}
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">사용자</p>
                <p className="text-muted-foreground text-xs">
                  <Link
                    href={`/members/${member.id}`}
                    className="text-sky-600 hover:underline"
                  >
                    {member.loginPhone || '비회원'}
                  </Link>
                </p>
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">상품</p>
                <p className="text-muted-foreground text-xs">
                  <Link
                    href={resolveProductHref(product.mallId, product.id)}
                    className="text-sky-600 hover:underline"
                  >
                    {product.productName}
                  </Link>
                </p>
              </div>
            </div>

            {/* 추천 사이즈 */}
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">추천 사이즈</p>
                <p className="text-muted-foreground text-xs">
                  {productSpecification.size || 'Free Size'}
                </p>
              </div>
            </div>
          </div>

          {/* 분석 시간 및 IP */}
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>{new Date(rec.createdAt).toLocaleString('ko-KR')}</span>
            </div>
            {rec.ip && (
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                <span>사용자 IP: {rec.ip}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 상품 이미지 및 상세 정보 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 상품 이미지 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">상품 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            {product.productImage ? (
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={product.productImage}
                  alt={product.productName || '상품 이미지'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상품 상세 정보 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">상품 상세 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{product.productName}</h3>
              {product.brand && (
                <p className="text-muted-foreground text-sm">{product.brand}</p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  카테고리
                </p>
                <p className="text-sm">
                  {PRODUCT_CATEGORIES.find(
                    (category) => category.value === product.category
                  )?.label || '미분류'}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  브랜드
                </p>
                <p className="text-sm">{product.brand || '미지정'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  상품 번호(PRODUCT_NO)
                </p>
                <p className="text-sm">{product.productNo}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  SHOP_NO(멀티쇼핑몰이 아닌 경우 default 1)
                </p>
                <p className="text-sm">{product.shopNo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 분석 결과 */}
      {sizeResults && sizeResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              AI 사이즈 분석 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {sizeResults.map((result, index) => (
                <Card key={index}>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={result.best ? 'default' : 'secondary'}
                            className="flex items-center gap-1"
                          >
                            {result.best && <CheckCircle className="h-3 w-3" />}
                            {result.size}
                          </Badge>
                          <div>
                            <h4 className="font-semibold">{result.title}</h4>
                            <p className="text-muted-foreground text-sm">
                              {result.subTitle}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">
                              {result.avgScore.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            평균 점수
                          </p>
                        </div>
                      </div>

                      {/* 상세 설명 */}
                      {result.descriptions &&
                        result.descriptions.length > 0 && (
                          <div className="space-y-2">
                            {result.descriptions.map((desc, descIndex) => (
                              <p
                                key={descIndex}
                                className="text-muted-foreground text-sm"
                              >
                                • {desc}
                              </p>
                            ))}
                          </div>
                        )}

                      {/* 개별 점수 */}
                      {/* {result.scores.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm">
                            세부 분석 점수
                          </h5>
                          <div className="space-y-2">
                            {result.scores.map((score, scoreIndex) => (
                              <div key={scoreIndex} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>{score.subject}</span>
                                  <span className="font-medium">
                                    {score.amount}/100
                                  </span>
                                </div>
                                <Progress
                                  value={(score.amount / 100) * 100}
                                  className="h-2"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )} */}

                      {index < sizeResults.length - 1 && <Separator />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RecommendationDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-square" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
