import LoadingSpinner from '@/components/loading-spinner';
import { useDeleteReview, useUpdateReview } from '@/queries/orders';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/design-system/components/ui/alert-dialog';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { EditIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function ReviewActions({
  memberId,
  initialContent,
  specId,
  reviewId,
}: {
  memberId: number;
  initialContent: string | null;
  specId: number;
  reviewId: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <ReviewUpdate
        memberId={memberId}
        initialContent={initialContent}
        specId={specId}
      />
      <ReviewDelete memberId={memberId} reviewId={reviewId} />
    </div>
  );
}

function ReviewUpdate({
  memberId,
  initialContent,
  specId,
}: { memberId: number; initialContent: string | null; specId: number }) {
  const { mutate: updateReview } = useUpdateReview(memberId);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    content: z.string().min(1, { message: '리뷰 내용을 입력해주세요.' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: initialContent ?? '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { content } = values;

    setLoading(true);
    updateReview(
      {
        productSpecificationId: specId,
        content,
      },
      {
        onSuccess: () => {
          toast.success('리뷰가 수정되었습니다.');
        },
        onError: () => {
          toast.error('리뷰 수정에 실패했습니다.');
        },
        onSettled: () => {
          setOpen(false);
          setLoading(false);
        },
      }
    );
  };

  useEffect(() => {
    if (open && initialContent) {
      form.setValue('content', initialContent);
    }
  }, [open, initialContent, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <EditIcon className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>리뷰 수정</DialogTitle>
          <DialogDescription>리뷰 내용을 수정할 수 있습니다.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>리뷰 수정</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="리뷰 내용을 입력하세요"
                      value={field.value}
                      onChange={field.onChange}
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                수정
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDelete({
  memberId,
  reviewId,
}: { memberId: number; reviewId: number }) {
  const { mutate: deleteReview } = useDeleteReview(memberId);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = () => {
    setLoading(true);
    deleteReview(
      { reviewIds: [reviewId] },
      {
        onSuccess: () => {
          toast.success('리뷰가 삭제되었습니다.');
        },
        onError: () => {
          toast.error('리뷰 삭제에 실패했습니다.');
        },
        onSettled: () => {
          setLoading(false);
          setOpen(false);
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <TrashIcon className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>리뷰를 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            사용자의 리뷰가 삭제되며, 사이즈 추천에 활용되지 않습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={onConfirm}>
            {loading ? <LoadingSpinner /> : '확인'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
