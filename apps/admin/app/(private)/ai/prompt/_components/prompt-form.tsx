'use client';

import LoadingSpinner from '@/components/loading-spinner';
import { useSizePrompt, useUpdateSizePrompt } from '@/queries/size-prompt';
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
  prompt: z.string().min(1),
});

export default function PromptForm() {
  const { data: sizePrompt } = useSizePrompt();
  const { mutate: updateSizePrompt } = useUpdateSizePrompt();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { prompt } = values;
    setLoading(true);
    updateSizePrompt(prompt, {
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
    if (sizePrompt?.prompt) {
      form.setValue('prompt', sizePrompt.prompt);
    }
  }, [sizePrompt, form.setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-600" />
          사이즈 추천 프롬프트
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          사이즈 추천에 활용되는 프롬프트를 수정할 수 있습니다. 말투, 내용, 어조
          등을 수정하여 추천 결과를 조정할 수 있습니다.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prompt"
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
  const currentPrompt = form.watch('prompt');

  const handleReset = () => {
    if (!sizePrompt) {
      return;
    }
    form.setValue('prompt', sizePrompt.prompt);
  };

  const isSame = sizePrompt?.prompt === currentPrompt;

  return (
    <Button variant="outline" onClick={handleReset} disabled={isSame}>
      <RotateCcw className="h-4 w-4" />
      <span>되돌리기</span>
    </Button>
  );
}
