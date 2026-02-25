import type { MyColumnMeta, MyGlobalFilter } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Separator } from '@repo/design-system/components/ui/separator';
import type { Column, Updater } from '@tanstack/react-table';
import { SearchIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  q: z.string(),
  qKey: z.string(),
});

export function DataTableSearch<TData>({
  columns,
  globalFilter,
  setGlobalFilter,
}: {
  columns: Column<TData, unknown>[];
  globalFilter: MyGlobalFilter;
  setGlobalFilter: (updater: Updater<MyGlobalFilter>) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      q: globalFilter.q,
      qKey: globalFilter.qKey,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { q, qKey } = values;
    setGlobalFilter({
      q,
      qKey,
    });
  };

  useEffect(() => {
    form.setValue('q', globalFilter.q);
  }, [globalFilter.q, form.setValue]);

  useEffect(() => {
    form.setValue('qKey', globalFilter.qKey);
  }, [globalFilter.qKey, form.setValue]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mb-2 flex h-10 items-center rounded-md border border-input bg-transparent py-1"
      >
        <FormField
          control={form.control}
          name="qKey"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 w-[120px] border-none shadow-none focus:ring-0 focus-visible:ring-0 lg:w-[150px]">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {(column.columnDef.meta as MyColumnMeta)?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <Separator orientation="vertical" className="scale-y-75" />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="mx-2 hidden shrink-0 stroke-border md:block"
        >
          <SearchIcon />
        </Button>
        <FormField
          control={form.control}
          name="q"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  placeholder="검색"
                  className="border-none shadow-none outline-none focus-visible:ring-0 md:pl-0"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
