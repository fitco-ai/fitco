'use client';

import { DataTableServer } from '@/components/data-table/server';
import { Formatters } from '@/utils/formatters';
import type { SelectMall } from '@repo/database';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export default function MallsTable({
  items,
  totalItems,
}: { items: SelectMall[]; totalItems: number }) {
  const columns: ColumnDef<SelectMall>[] = [
    {
      id: 'cafe24MallId',
      accessorKey: 'cafe24MallId',
      enableGlobalFilter: true,
      enableSorting: true,
      meta: {
        name: '몰 아이디',
        filterVariant: 'text',
      },
      header: '몰 아이디(mall_id)',
      cell: (data) => {
        return (
          <Link
            href={`/products/mall/${data.row.original.id}`}
            prefetch={false}
            className="text-sky-600 hover:underline"
          >
            {data.getValue() as string}
          </Link>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      enableGlobalFilter: false,
      enableSorting: true,
      header: '연동일',
      cell: (data) => {
        return Formatters.date.korYmd(data.getValue() as Date);
      },
    },
  ];

  return (
    <DataTableServer data={items} columns={columns} totalItems={totalItems} />
  );
}
