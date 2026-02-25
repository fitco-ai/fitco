'use client';

import useSearchParams from '@/hooks/use-search-params';
import type { MyColumnMeta } from '@/types';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronsUpDownIcon } from 'lucide-react';
import { useMemo } from 'react';
import DataTablePagination from './data-table-pagination';
import { DataTableSearch } from './data-table-search';

interface DataTableServerProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  pageSizeEnabled?: boolean;
}

export function DataTableServer<TData, TValue>({
  data,
  columns,
  totalItems,
  pageSizeEnabled = true,
}: DataTableServerProps<TData, TValue>) {
  const { queryParams, setQuery, setPagination, setSorting } =
    useSearchParams();

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: { q: queryParams.q, qKey: queryParams.qKey },
      pagination: {
        pageIndex: queryParams.pageIndex,
        pageSize: queryParams.pageSize,
      },
      sorting: [
        {
          id: queryParams.sorting.split('.')[0],
          desc: queryParams.sorting.split('.')[1] === 'desc',
        },
      ],
    },
    rowCount: totalItems,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onGlobalFilterChange: setQuery,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const textFilteringColumns = useMemo(() => {
    return table.getAllFlatColumns().filter((column) => {
      return (column.columnDef.meta as MyColumnMeta)?.filterVariant === 'text';
    });
  }, [table]);

  return (
    <div className="truncate">
      {textFilteringColumns.length > 0 && (
        <DataTableSearch
          columns={textFilteringColumns}
          globalFilter={table.getState().globalFilter}
          setGlobalFilter={table.setGlobalFilter}
        />
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    <div className="flex items-center justify-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            header.column.toggleSorting(
                              header.column.getIsSorted() === 'asc'
                            )
                          }
                        >
                          <ChevronsUpDownIcon />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} align="center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                결과가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination
        currentPage={queryParams.pageIndex + 1}
        totalPages={Math.ceil(totalItems / queryParams.pageSize)}
        pageSize={queryParams.pageSize}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        pageSizeEnabled={pageSizeEnabled}
        previousPage={table.previousPage}
        nextPage={table.nextPage}
        setPageSize={table.setPageSize}
      />
    </div>
  );
}
