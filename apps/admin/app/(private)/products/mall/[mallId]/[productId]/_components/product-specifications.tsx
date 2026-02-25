'use client';
import { useProductDetail, useUpdateSpec } from '@/queries/product';
import type { SelectProductSpecification } from '@repo/database';
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { AlertCircle, Edit, Ruler } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProductSpecifications({
  productId,
}: { productId: number }) {
  const { data, isLoading } = useProductDetail(productId);

  if (isLoading) {
    return <ProductSpecificationsSkeleton />;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            상품 사양 정보를 찾을 수 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  const specs = data.specs;

  if (specs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            상품 사양
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="flex flex-col items-center space-y-2">
              <AlertCircle className="h-8 w-8" />
              <span>등록된 사양 정보가 없습니다.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ruler className="h-5 w-5" />
            <span>상품 사이즈 목록</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {specs.map((spec) => (
              <Badge key={spec.id} variant="outline" className="text-sm">
                {spec.size || 'Free Size'}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 각 사이즈별 상세 사양 */}
        {specs.map((spec) => {
          const specData = spec.spec as Record<string, string> | null;

          if (!specData || Object.keys(specData).length === 0) {
            return null;
          }

          return (
            <Card key={spec.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{spec.size || 'Free Size'} 사이즈 상세 사양</span>
                  <EditSpecificationDialog spec={spec} productId={productId} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2 font-medium">
                          측정 항목
                        </TableHead>
                        <TableHead className="w-1/2 font-medium">
                          측정값
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(specData).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function EditSpecificationDialog({
  spec,
  productId,
}: { spec: SelectProductSpecification; productId: number }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: updateSpec } = useUpdateSpec(productId);

  const specData = spec.spec as Record<string, string> | null;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && specData) {
      setFormData({ ...specData });
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setIsLoading(true);

    updateSpec(
      {
        specId: spec.id,
        payload: formData,
      },
      {
        onSuccess: () => {
          toast.success('사이즈 정보가 업데이트되었습니다.');
        },
        onError: () => {
          toast.error('사이즈 정보 업데이트에 실패했습니다.');
        },
        onSettled: () => {
          setIsLoading(false);
          setOpen(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setOpen(false);
    if (specData) {
      setFormData({ ...specData });
    }
  };

  if (!specData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Edit className="mr-1 h-4 w-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{spec.size || 'Free Size'} 사이즈 사양 수정</DialogTitle>
          <DialogDescription>
            측정 항목별 값을 수정할 수 있습니다. 변경사항은 저장 버튼을 눌러야
            적용됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {Object.entries(specData).map(([key, originalValue]) => (
            <div key={key} className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor={key} className="text-right font-medium">
                {key}
              </Label>
              <Input
                id={key}
                value={formData[key] || ''}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="col-span-2"
                placeholder={originalValue}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductSpecificationsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-18" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
