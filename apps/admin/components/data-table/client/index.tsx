'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import {
  type Column,
  type ColumnDef,
  type Row,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import _ from 'lodash';
import { ChevronsUpDownIcon } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import DataTableFilter from './table-filter';
import DataTablePagination from './table-pagination';

interface DataTableClientProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  rowSelection?: RowSelectionState;
  setRowSelection?: Dispatch<SetStateAction<RowSelectionState>>;
  getRowId?: (row: TData) => string;
  enableRowSelection?: (row: Row<TData>) => boolean;
  paginationTop?: boolean;
  preserveRowCount?: boolean;
  searchFilters?: {
    value: string;
    label: string;
  }[];
}

export default function DataTableClient<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  rowSelection,
  setRowSelection,
  getRowId,
  enableRowSelection,
  paginationTop = false,
  preserveRowCount = false,
  searchFilters,
}: DataTableClientProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    state: {
      rowSelection: rowSelection ?? {},
    },
    enableRowSelection: enableRowSelection,
    getRowId: getRowId,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="truncate">
      {searchFilters && (
        <div className="my-2">
          <DataTableFilter
            columnFilters={table.getState().columnFilters}
            setColumnFilters={table.setColumnFilters}
            setPageIndex={table.setPageIndex}
            searchFilters={searchFilters}
          />
        </div>
      )}
      {paginationTop && (
        <DataTablePagination
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          previousPage={table.previousPage}
          nextPage={table.nextPage}
        />
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 items-center gap-1">
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
                      {header.column.getCanFilter() && (
                        <div className="w-full">
                          <Filter column={header.column} />
                        </div>
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
            <>
              {table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} align="center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {preserveRowCount &&
                _.range(0, pageSize - table.getRowModel().rows.length).map(
                  (num) => (
                    <TableRow key={`empty-row-${num}`}>
                      <TableCell colSpan={999} className="text-center">
                        -
                      </TableCell>
                    </TableRow>
                  )
                )}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                결과가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!paginationTop && (
        <DataTablePagination
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          previousPage={table.previousPage}
          nextPage={table.nextPage}
        />
      )}
    </div>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <div>
      <Input
        className="h-7 rounded-none bg-white"
        value={(columnFilterValue as string) ?? ''}
        onChange={(e) => {
          column.setFilterValue(e.target.value);
        }}
      />
    </div>
  );
}
