'use client';

import { useMall, useUpdateMallMemo } from '@/queries/malls';
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
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Edit, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MallMemoProps {
  mallId: number;
}

export default function MallMemo({ mallId }: MallMemoProps) {
  const { data: mall } = useMall(mallId);
  const { mutate: updateMemo, isPending } = useUpdateMallMemo(mallId);
  const [open, setOpen] = useState(false);
  const [memo, setMemo] = useState('');

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && mall) {
      setMemo(mall.memo || '');
    }
  };

  const handleSave = () => {
    updateMemo(memo, {
      onSuccess: () => {
        toast.success('메모가 저장되었습니다.');
        setOpen(false);
      },
      onError: () => {
        toast.error('메모 저장에 실패했습니다.');
      },
    });
  };

  const handleCancel = () => {
    setOpen(false);
    if (mall) {
      setMemo(mall.memo || '');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          쇼핑몰 메모
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="min-h-[100px] rounded-lg border bg-muted/50 p-3">
            {mall?.memo ? (
              <p className="whitespace-pre-wrap text-sm">{mall.memo}</p>
            ) : (
              <p className="text-muted-foreground text-sm">
                메모가 없습니다. 편집 버튼을 클릭하여 메모를 추가하세요.
              </p>
            )}
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                메모 편집
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>쇼핑몰 메모 편집</DialogTitle>
                <DialogDescription>
                  쇼핑몰에 대한 메모를 작성하세요. 관리자만 볼 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="쇼핑몰에 대한 메모를 입력하세요..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                  취소
                </Button>
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? '저장 중...' : '저장'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
