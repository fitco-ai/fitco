'use client';

import type { ReviewTableRow } from '@/actions/reviews/getReviews';
import { DataTableServer } from '@/components/data-table/server';
import { resolveProductHref } from '@/utils/common';
import { Formatters } from '@/utils/formatters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import type { ColumnDef } from '@tanstack/react-table';
import _ from 'lodash';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReviewsTable({
  items,
  totalItems,
}: { items: ReviewTableRow[]; totalItems: number }) {
  const columns: ColumnDef<ReviewTableRow>[] = [
    {
      id: 'productImage',
      accessorKey: 'product.productImage',
      enableGlobalFilter: false,
      enableSorting: false,
      header: '상품 이미지',
      cell: (data) => {
        const mallId = data.row.original.product.mallId;
        const productId = data.row.original.product.id;
        const imageUrl = data.getValue() as string;

        return (
          <Link
            href={resolveProductHref(mallId, productId)}
            className="relative flex size-[50px] items-center justify-center bg-muted"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt=""
                width={50}
                height={50}
                unoptimized
                className="size-[50px] object-contain"
              />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" />
            )}
          </Link>
        );
      },
    },
    {
      id: 'productName',
      accessorKey: 'product.productName',
      enableGlobalFilter: true,
      enableSorting: false,
      meta: {
        name: '상품명',
        filterVariant: 'text',
      },
      header: '상품명',
      cell: (data) => {
        const mallId = data.row.original.product.mallId;
        const productId = data.row.original.product.id;
        const content = data.getValue() as string;
        const value = content
          ? _.truncate(content, { length: 20, omission: '...' })
          : '미입력';

        return (
          <Link
            href={resolveProductHref(mallId, productId)}
            className="text-sky-600"
          >
            {value}
          </Link>
        );
      },
    },
    {
      id: 'loginPhone',
      accessorKey: 'member.loginPhone',
      enableGlobalFilter: true,
      enableSorting: false,
      meta: {
        name: '작성자',
        filterVariant: 'text',
      },
      header: '작성자',
      cell: (data) => {
        const loginPhone = data.getValue() as string;
        const memberId = data.row.original.member.id;
        return (
          <Link
            href={`/members/${memberId}`}
            className="text-sky-600 hover:underline"
          >
            {loginPhone ?? '비회원'}
          </Link>
        );
      },
    },
    {
      id: 'cafe24MallId',
      accessorKey: 'product.cafe24MallId',
      enableGlobalFilter: true,
      enableSorting: false,
      meta: {
        name: '쇼핑몰',
        filterVariant: 'text',
      },
      header: '쇼핑몰',
      cell: (data) => {
        const cafe24MallId = data.getValue() as string | null;
        const mallId = data.row.original.product.mallId;

        // 수동입력된 상품
        if (!cafe24MallId) {
          return '-';
        }

        // url 등록된 상품
        if (!mallId) {
          return <div>{cafe24MallId}</div>;
        }

        return (
          <Link
            href={`/malls/${mallId}`}
            className="text-sky-600 hover:underline"
          >
            {cafe24MallId}
          </Link>
        );
      },
    },
    {
      id: 'content',
      accessorKey: 'review.content',
      enableGlobalFilter: false,
      enableSorting: false,
      header: '내용',
      cell: (data) => {
        const content = data.getValue() as string;

        if (!content) {
          return null;
        }

        return (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded px-2 py-1 text-left transition-colors hover:bg-muted/50 hover:underline"
              >
                {_.truncate(content, { length: 20, omission: '...' })}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>리뷰 내용</DialogTitle>
                <DialogDescription>
                  전체 리뷰 내용을 확인할 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {content}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'review.createdAt',
      enableGlobalFilter: false,
      enableSorting: true,
      header: '작성일',
      cell: (data) => {
        return Formatters.date.korYmd(data.getValue() as Date);
      },
    },
  ];

  return (
    <DataTableServer data={items} columns={columns} totalItems={totalItems} />
  );
}
