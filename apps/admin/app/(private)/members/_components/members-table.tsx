'use client';

import { DataTableServer } from '@/components/data-table/server';
import { Formatters } from '@/utils/formatters';
import type { SelectMember } from '@repo/database';
import { Badge } from '@repo/design-system/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export default function MembersTable({
  items,
  totalItems,
}: { items: SelectMember[]; totalItems: number }) {
  const columns: ColumnDef<SelectMember>[] = [
    {
      id: 'loginPhone',
      accessorKey: 'loginPhone',
      enableGlobalFilter: true,
      enableSorting: true,
      meta: {
        name: '전화번호',
        filterVariant: 'text',
      },
      header: '전화번호',
      cell: (data) => {
        const value = data.getValue() as string;
        return (
          <Link
            href={`/members/${data.row.original.id}`}
            prefetch={false}
            className="text-sky-600 hover:underline"
          >
            {value ?? '비회원'}
          </Link>
        );
      },
    },
    {
      id: 'onboarding',
      accessorKey: 'onboarding',
      enableGlobalFilter: false,
      enableSorting: true,
      header: '온보딩',
      cell: (data) => {
        const onboarding = data.getValue() as boolean;

        return (
          <Badge variant={onboarding ? 'outline' : 'default'}>
            {onboarding ? '미완료' : '완료'}
          </Badge>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      enableGlobalFilter: false,
      enableSorting: true,
      header: '가입일',
      cell: (data) => {
        return Formatters.date.korYmd(data.getValue() as Date);
      },
    },
  ];

  return (
    <DataTableServer data={items} columns={columns} totalItems={totalItems} />
  );
}
