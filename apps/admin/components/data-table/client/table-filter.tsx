import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import type { ColumnFiltersState, Updater } from '@tanstack/react-table';
import { SearchIcon, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { type UseFormWatch, useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  searchVal: z.string().optional(),
});

export default function DataTableClientFilter({
  columnFilters,
  setColumnFilters,
  setPageIndex,
  searchFilters,
}: {
  columnFilters: ColumnFiltersState;
  setColumnFilters: (updater: Updater<ColumnFiltersState>) => void;
  setPageIndex: (updater: Updater<number>) => void;
  searchFilters: {
    value: string;
    label: string;
  }[];
}) {
  const [localFilters, setLocalFilters] =
    useState<ColumnFiltersState>(columnFilters);
  const [filterKey, setFilterKey] = useState<string>(searchFilters[0].value);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchVal: '',
    },
  });

  const addToFilter = () => {
    const searchVal = form.getValues('searchVal');
    if (searchVal?.trim() === '') {
      return;
    }
    let newLocalFilters: ColumnFiltersState = [];
    const index = localFilters.findIndex((filter) => filter.id === filterKey);
    if (index === -1) {
      newLocalFilters = [
        ...localFilters,
        { id: filterKey, value: [searchVal] },
      ];
    } else {
      newLocalFilters = [
        ...localFilters.slice(0, index),
        {
          id: localFilters[index].id,
          value: [...(localFilters[index].value as string), searchVal],
          ...localFilters.slice(index + 1),
        },
      ];
    }
    setLocalFilters(newLocalFilters);
    setColumnFilters(newLocalFilters);
    setPageIndex(0);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { searchVal } = values;
    if (localFilters.some((filter) => filter.id === filterKey)) {
      const index = localFilters.findIndex((filter) => filter.id === filterKey);
      if (localFilters[index].value === searchVal) {
        return;
      }
      setColumnFilters([
        ...localFilters.slice(0, index),
        {
          id: localFilters[index].id,
          value: [...(localFilters[index].value as string[]), searchVal],
          ...localFilters.slice(index + 1),
        },
      ]);
    } else {
      setColumnFilters([
        ...localFilters,
        { id: filterKey, value: [searchVal] },
      ]);
    }
    setPageIndex(0);
  };

  const deleteFilter = useCallback(
    (filterId: string, filterValue: string) => {
      setColumnFilters((prev) =>
        prev.map((filter) => {
          if (filter.id === filterId) {
            return {
              id: filter.id,
              value: (filter.value as string[]).filter(
                (v) => v !== filterValue
              ),
            };
          }
          return filter;
        })
      );
      setLocalFilters((prev) =>
        prev.map((filter) => {
          if (filter.id === filterId) {
            return {
              id: filter.id,
              value: (filter.value as string[]).filter(
                (v) => v !== filterValue
              ),
            };
          }
          return filter;
        })
      );
      setPageIndex(0);
    },
    [setColumnFilters, setPageIndex]
  );

  return (
    <div className="mb-2">
      <div className="mb-2 flex flex-col justify-end gap-2 lg:flex-row lg:items-center">
        <Select value={filterKey} onValueChange={setFilterKey}>
          <SelectTrigger className="h-10 w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            {searchFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="searchVal"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative h-10 w-[300px]">
                      <Input
                        placeholder="검색"
                        className="absolute inset-0 h-10 border-gray-300 pr-10 focus-visible:ring-0"
                        {...field}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="-translate-y-1/2 absolute top-1/2 right-0 hover:bg-transparent"
                      >
                        <SearchIcon />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <NewFilterButton addToFilter={addToFilter} watch={form.watch} />
      </div>
      <AppliedFilters
        localFilters={localFilters}
        deleteFilter={deleteFilter}
        searchFilters={searchFilters}
      />
    </div>
  );
}

function AppliedFilters({
  localFilters,
  deleteFilter,
  searchFilters,
}: {
  localFilters: ColumnFiltersState;
  deleteFilter: (filterId: string, filterValue: string) => void;
  searchFilters: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {localFilters.map((filter) => {
        return (filter.value as string[]).map((v, i) => (
          <div key={filter.id + i}>
            <Badge variant="outline" className="rounded-full px-3 py-2">
              <span>{`${searchFilters.find((f) => f.value === filter.id)?.label} 포함: ${v}`}</span>
              <Button
                variant="ghost"
                className="h-5 w-5 px-0 py-0 opacity-70 hover:bg-transparent hover:opacity-100"
                onClick={() => deleteFilter(filter.id, v)}
              >
                <X />
              </Button>
            </Badge>
          </div>
        ));
      })}
    </div>
  );
}

function NewFilterButton({
  addToFilter,
  watch,
}: {
  addToFilter: () => void;
  watch: UseFormWatch<{ searchVal?: string | undefined }>;
}) {
  const searchVal = watch('searchVal');
  return (
    <Button
      type="button"
      variant="link"
      className="h-10 text-blue-500"
      onClick={addToFilter}
      disabled={searchVal?.trim() === ''}
    >
      필터 추가
    </Button>
  );
}

const FILTER_KEY_LABELS: Record<string, string> = {
  name: '캠페인명',
  cpType: '캠페인 타입',
  status: '상태',
  platform: '매체',
};
