import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import type { Updater } from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export const PAGE_SIZES = [10, 20, 50, 100];

function PageSizeSelect({
  pageSize,
  setPageSize,
}: { pageSize: number; setPageSize: (updater: Updater<number>) => void }) {
  const handleChange = (value: string) => {
    setPageSize(Number(value));
  };

  return (
    <Select value={String(pageSize)} onValueChange={handleChange}>
      <SelectTrigger className="w-fit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PAGE_SIZES.map((size) => (
          <SelectItem key={size} value={size.toString()}>
            {size}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  canPreviousPage,
  canNextPage,
  pageSizeEnabled,
  previousPage,
  nextPage,
  setPageSize,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageSizeEnabled: boolean;
  previousPage: () => void;
  nextPage: () => void;
  setPageSize: (updater: Updater<number>) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {pageSizeEnabled && (
        <PageSizeSelect pageSize={pageSize} setPageSize={setPageSize} />
      )}
      <div className="flex items-center space-x-3 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={previousPage}
          disabled={!canPreviousPage}
        >
          <ChevronLeftIcon />
          <span>이전</span>
        </Button>
        <div className="flex items-center gap-2">
          <Label>{currentPage.toLocaleString()}</Label>
          <Label>/</Label>
          <Label>{totalPages.toLocaleString()}</Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={nextPage}
          disabled={!canNextPage}
        >
          <span>다음</span>
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
