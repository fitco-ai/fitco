'use client';

import type { AiTokenUsageRow } from '@/actions/token-usage/getTokenUsages';
import { DataTableServer } from '@/components/data-table/server';
import { resolveProductHref } from '@/utils/common';
import { AI_TOKEN_USAGES } from '@repo/database/src/const';
import type { ColumnDef } from '@tanstack/react-table';
import _ from 'lodash';
import Link from 'next/link';

export default function TokenListTable({
  items,
  totalItems,
}: {
  items: AiTokenUsageRow[];
  totalItems: number;
}) {
  const columns: ColumnDef<AiTokenUsageRow>[] = [
    {
      id: 'productName',
      accessorKey: 'product.productName',
      enableGlobalFilter: true,
      enableSorting: false,
      header: '상품명',
      meta: {
        name: '상품명',
        filterVariant: 'text',
      },
      cell: (data) => {
        const mallId = data.row.original.product?.mallId ?? null;
        const product = data.row.original.product;

        if (!product) {
          return <div>외부</div>;
        }

        const href = resolveProductHref(mallId, product.id);
        return (
          <Link href={href} className="text-blue-500">
            {_.truncate(product.productName ?? '미입력', {
              length: 20,
              omission: '...',
            })}
          </Link>
        );
      },
    },
    {
      id: 'token',
      accessorKey: 'aiTokenUsage.token',
      enableGlobalFilter: false,
      enableSorting: true,
      header: '토큰 사용량',
      cell: (data) => {
        const token = data.getValue() as number;
        return <div>{token.toLocaleString()}</div>;
      },
    },
    {
      id: 'durationSeconds',
      accessorKey: 'aiTokenUsage.durationSeconds',
      enableGlobalFilter: false,
      enableSorting: true,
      header: '소요 시간(초)',
      cell: (data) => {
        const durationSeconds = data.getValue() as number;
        return <div>{durationSeconds.toLocaleString()}</div>;
      },
    },
    {
      id: 'dateStr',
      accessorKey: 'aiTokenUsage.dateStr',
      enableGlobalFilter: false,
      enableSorting: true,
      header: '날짜',
      cell: (data) => {
        const dateStr = data.getValue() as string;
        return <div>{dateStr}</div>;
      },
    },
    {
      accessorKey: 'aiTokenUsage.type',
      header: '유형',
      enableGlobalFilter: false,
      enableSorting: false,
      cell: (data) => {
        const type = data.getValue() as string;
        return (
          <div>
            {AI_TOKEN_USAGES.find((usage) => usage.value === type)?.label ??
              '-'}
          </div>
        );
      },
    },
  ];

  return (
    <DataTableServer data={items} columns={columns} totalItems={totalItems} />
  );
}
