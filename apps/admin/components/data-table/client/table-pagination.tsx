import { Button } from '@repo/design-system/components/ui/button';

export default function DataTablePagination({
  canPreviousPage,
  canNextPage,
  previousPage,
  nextPage,
}: {
  canPreviousPage: boolean;
  canNextPage: boolean;
  previousPage: () => void;
  nextPage: () => void;
}) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={previousPage}
        disabled={!canPreviousPage}
      >
        이전
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={nextPage}
        disabled={!canNextPage}
      >
        다음
      </Button>
    </div>
  );
}
