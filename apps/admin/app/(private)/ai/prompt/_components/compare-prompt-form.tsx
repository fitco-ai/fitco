'use client';

import LoadingSpinner from '@/components/loading-spinner';
import {
  useSizePrompt,
  useUpdateSizeComparePrompt,
} from '@/queries/size-prompt';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { RotateCcw, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
  comparePrompt: z.string().min(1),
});

export default function ComparePromptForm() {
  const { data: sizePrompt } = useSizePrompt();
  const { mutate: updateSizeComparePrompt } = useUpdateSizeComparePrompt();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comparePrompt: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { comparePrompt } = values;
    setLoading(true);
    updateSizeComparePrompt(comparePrompt, {
      onSuccess: () => {
        toast.success('프롬프트가 성공적으로 업데이트되었습니다.');
      },
      onError: () => {
        toast.error('프롬프트 업데이트에 실패했습니다.');
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  }

  useEffect(() => {
    if (sizePrompt?.comparePrompt) {
      form.setValue('comparePrompt', sizePrompt.comparePrompt);
    }
  }, [sizePrompt, form.setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-600" />
          사이즈 비교 프롬프트
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          각 사이즈별 비교 데이터를 생성하는 프롬프트를 수정할 수 있습니다.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="comparePrompt"
              disabled={loading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프롬프트</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="프롬프트를 입력해 주세요."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? <LoadingSpinner /> : '저장'}
              </Button>
              <ResetButton />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ResetButton() {
  const form = useFormContext();
  const { data: sizePrompt } = useSizePrompt();
  const currentPrompt = form.watch('comparePrompt');

  const handleReset = () => {
    if (!sizePrompt) {
      return;
    }
    form.setValue('comparePrompt', sizePrompt.comparePrompt);
  };

  const isSame = sizePrompt?.comparePrompt === currentPrompt;

  return (
    <Button variant="outline" onClick={handleReset} disabled={isSame}>
      <RotateCcw className="h-4 w-4" />
      <span>되돌리기</span>
    </Button>
  );
}
