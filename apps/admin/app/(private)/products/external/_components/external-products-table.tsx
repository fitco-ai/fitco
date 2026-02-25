'use client';

import { DataTableServer } from '@/components/data-table/server';
import type { SelectProduct } from '@repo/database';
import { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import type { ColumnDef } from '@tanstack/react-table';
import _ from 'lodash';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ExternalProductsTable({
  items,
  totalItems,
}: { items: SelectProduct[]; totalItems: number }) {
  const columns: ColumnDef<SelectProduct>[] = [
    {
      accessorKey: 'productImage',
      enableGlobalFilter: false,
      enableSorting: false,
      header: '이미지',
      cell: (data) => {
        const productdImage = data.getValue() as string;
        return (
          <Link
            href={`/products/external/${data.row.original.id}`}
            prefetch={false}
            className="relative flex size-[50px] items-center justify-center bg-muted"
          >
            {productdImage ? (
              <Image
                src={productdImage}
                width={50}
                height={50}
                alt=""
                className="size-[50px] object-contain"
                unoptimized
              />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" />
            )}
          </Link>
        );
      },
    },
    {
      accessorKey: 'productName',
      enableGlobalFilter: true,
      enableSorting: true,
      meta: {
        name: '상품명',
        filterVariant: 'text',
      },
      header: '상품명',
      cell: (data) => {
        const value = data.getValue() as string;
        return (
          <Link
            href={`/products/external/${data.row.original.id}`}
            prefetch={false}
            className="text-sky-600 hover:underline"
          >
            {_.truncate(value, { length: 50, omission: '...' }) || '미입력'}
          </Link>
        );
      },
    },
    {
      accessorKey: 'category',
      enableGlobalFilter: true,
      enableSorting: true,
      meta: {
        name: '카테고리',
        filterVariant: 'select',
      },
      header: '카테고리',
      cell: (data) => {
        const value = data.getValue() as
          | (typeof PRODUCT_CATEGORIES)[number]['value']
          | null;
        return (
          <div>
            {PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? '-'}
          </div>
        );
      },
    },
  ];

  return (
    <DataTableServer data={items} columns={columns} totalItems={totalItems} />
  );
}
