'use client';

import {
  useProductDetail,
  useUpdateCategory,
  useUpdateMaterial,
} from '@/queries/product';
import { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Separator } from '@repo/design-system/components/ui/separator';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import {
  Atom,
  Edit,
  ExternalLink,
  Image as ImageIcon,
  Package,
  Tag,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProductInfo({ productId }: { productId: number }) {
  const { data, isLoading } = useProductDetail(productId);

  if (isLoading) {
    return <ProductInfoSkeleton />;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            상품 정보를 찾을 수 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  const product = data.product;
  const categoryLabel =
    PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label ||
    '미입력';

  let productUrl: string | null = null;

  if (product.cafe24MallId && product.productNo && product.shopNo) {
    productUrl = `https://${product.cafe24MallId}.cafe24.com/shop${product.shopNo}/product/detail.html?product_no=${product.productNo}`;
  }

  return (
    <div className="space-y-6">
      {/* 상품 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            상품 기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 상품 이미지 */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
            <div className="flex-shrink-0">
              {product.productImage ? (
                <div className="relative h-48 w-48 overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={product.productImage}
                    alt={product.productName || '상품 이미지'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg border bg-muted">
                  <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">이미지 없음</span>
                  </div>
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="flex-1 space-y-4">
              {/* 상품명 */}
              <div>
                <h2 className="font-semibold text-2xl tracking-tight">
                  {product.productName || '상품명 없음'}
                </h2>
              </div>

              <Separator />

              {/* 카테고리, 소재, 링크 */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
                      <Tag className="h-4 w-4" />
                      카테고리
                    </div>
                    <CategoryUpdateDialog
                      productId={productId}
                      currentCategory={
                        product.category as
                          | (typeof PRODUCT_CATEGORIES)[number]['value']
                          | null
                      }
                    />
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {categoryLabel}
                  </Badge>
                </div>
                {/* 소재 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
                      <Atom className="h-4 w-4" />
                      소재
                    </div>
                    <MaterialUpdateDialog
                      productId={productId}
                      currentMaterial={product.material}
                    />
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {product.material ?? '미입력'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
                      <ExternalLink className="h-4 w-4" />
                      상품 링크
                    </div>
                  </div>
                  {productUrl ? (
                    <Link
                      href={productUrl}
                      target="_blank"
                      className="text-sky-600 text-sm hover:underline"
                    >
                      {productUrl}
                    </Link>
                  ) : (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        상품 링크가 없습니다.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 브랜드 */}
              {product.brand && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="font-medium text-muted-foreground text-sm">
                      브랜드
                    </div>
                    <div className="text-sm">{product.brand}</div>
                  </div>
                </>
              )}

              {/* 상품 번호 */}
              {product.productNo && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="font-medium text-muted-foreground text-sm">
                      상품 번호
                    </div>
                    <div className="font-mono text-muted-foreground text-sm">
                      {product.productNo}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 추가 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Atom className="h-5 w-5" />
            <span>상세 정보</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="font-medium text-muted-foreground text-sm">
                상품 NO
              </div>
              <div className="font-mono text-sm">{product.productNo}</div>
            </div>
            {product.shopNo && (
              <div className="space-y-2">
                <div className="font-medium text-muted-foreground text-sm">
                  샵 번호(멀티샵 사용 시 기본값 1)
                </div>
                <div className="text-sm">{product.shopNo}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductInfoSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
            <Skeleton className="h-48 w-48" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryUpdateDialog({
  productId,
  currentCategory,
}: {
  productId: number;
  currentCategory: (typeof PRODUCT_CATEGORIES)[number]['value'] | null;
}) {
  const { mutate: updateCategory } = useUpdateCategory(productId);
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof PRODUCT_CATEGORIES)[number]['value']
  >(currentCategory ?? 'etc');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = () => {
    updateCategory(
      { category: selectedCategory },
      {
        onSuccess: () => {
          toast.success('카테고리가 변경되었습니다.');
        },
        onError: () => {
          toast.error('카테고리 변경에 실패했습니다.');
        },
        onSettled: () => {
          setLoading(false);
          setOpen(false);
        },
      }
    );
  };

  useEffect(() => {
    if (open && currentCategory) {
      setSelectedCategory(currentCategory);
    }
  }, [open, currentCategory]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2">
          <Edit className="mr-1 h-3 w-3" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>카테고리 변경</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="font-medium text-sm">현재 카테고리</div>
            <div className="text-muted-foreground text-sm">
              {!currentCategory && '-'}
              {currentCategory &&
                PRODUCT_CATEGORIES.find((c) => c.value === currentCategory)
                  ?.label}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-sm">새 카테고리</div>
            <Select
              value={selectedCategory}
              onValueChange={(value) =>
                setSelectedCategory(
                  value as (typeof PRODUCT_CATEGORIES)[number]['value']
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button
              onClick={handleCategoryChange}
              disabled={selectedCategory === currentCategory || loading}
            >
              변경
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MaterialUpdateDialog({
  productId,
  currentMaterial,
}: {
  productId: number;
  currentMaterial: string | null;
}) {
  const { mutate: updateMaterial } = useUpdateMaterial(productId);
  const [material, setMaterial] = useState<string>(currentMaterial ?? '');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMaterialChange = () => {
    setLoading(true);
    updateMaterial(
      { material: material.trim() === '' ? null : material.trim() },
      {
        onSuccess: () => {
          toast.success('소재가 변경되었습니다.');
        },
        onError: () => {
          toast.error('소재 변경에 실패했습니다.');
        },
        onSettled: () => {
          setLoading(false);
          setOpen(false);
        },
      }
    );
  };

  useEffect(() => {
    if (open) {
      setMaterial(currentMaterial ?? '');
    }
  }, [open, currentMaterial]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2">
          <Edit className="mr-1 h-3 w-3" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>소재 변경</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="font-medium text-sm">현재 소재</div>
            <div className="text-muted-foreground text-sm">
              {currentMaterial ?? '미입력'}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-sm">새 소재</div>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="예: 면 100%"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleMaterialChange} disabled={loading}>
              변경
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
