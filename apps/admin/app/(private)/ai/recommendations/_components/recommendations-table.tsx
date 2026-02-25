'use client';

import { DataTableServer } from '@/components/data-table/server';
import { resolveProductHref } from '@/utils/common';
import { Formatters } from '@/utils/formatters';
import type {
  SelectMall,
  SelectMember,
  SelectProduct,
  SelectProductSpecification,
  SelectRecommendation,
} from '@repo/database';
import type { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';

type TableRow = {
  recommendation: SelectRecommendation & { hashId: string };
  mall: SelectMall;
  member: SelectMember;
  productSpecification: SelectProductSpecification;
  product: SelectProduct;
};

export default function RecommendationsTable({
  items,
  totalItems,
}: {
  items: TableRow[];
  totalItems: number;
}) {
  const columns: ColumnDef<TableRow>[] = [
    {
      id: 'hashId',
      accessorKey: 'recommendation.hashId',
      enableGlobalFilter: false,
      enableSorting: false,
      header: '추천 로그 ID',
      cell: (data) => {
        const hashId = data.getValue() as number;
        return (
          <Link
            href={`/ai/recommendations/${data.row.original.recommendation.hashId}`}
            prefetch={false}
            className="text-sky-600 hover:underline"
          >
            {hashId}
          </Link>
        );
      },
    },
    {
      id: 'productImage',
      accessorKey: 'product.productImage',
      enableGlobalFilter: true,
      enableSorting: false,
      header: '상품 이미지',
      cell: (data) => {
        const mallId = data.row.original.product.mallId;
        const productId = data.row.original.product.id;
        const productImage = data.getValue() as string | null;

        return productImage ? (
          <Link href={resolveProductHref(mallId, productId)} prefetch={false}>
            <Image
              src={productImage}
              alt=""
              width={50}
              height={50}
              className="size-[50px] object-cover"
              unoptimized
            />
          </Link>
        ) : (
          '-'
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
        const productName = data.getValue() as string | null;
        const mallId = data.row.original.product.mallId;
        const productId = data.row.original.product.id;
        return (
          <Link
            href={resolveProductHref(mallId, productId)}
            className="text-sky-600"
          >
            {productName}
          </Link>
        );
      },
    },
    {
      id: 'cafe24MallId',
      accessorKey: 'mall.cafe24MallId',
      enableGlobalFilter: true,
      enableSorting: false,
      meta: {
        name: '몰ID',
        filterVariant: 'text',
      },
      header: '몰ID',
      cell: (data) => {
        const cafe24MallId = data.getValue() as string | null;
        const mallId = data.row.original.mall.id;

        return (
          <Link className="text-sky-600" href={`/malls/${mallId}`}>
            {cafe24MallId ?? '-'}
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
        name: '전화번호',
        filterVariant: 'text',
      },
      header: '사용자 전화번호',
      cell: (data) => {
        const loginPhone = data.getValue() as string | null;
        const memberId = data.row.original.member.id;
        return (
          <Link className="text-sky-600" href={`/members/${memberId}`}>
            {loginPhone ?? '비회원'}
          </Link>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'recommendation.createdAt',
      enableGlobalFilter: false,
      enableSorting: true,
      header: '날짜',
      cell: (data) => {
        const createdAt = data.getValue() as Date;
        return <div>{Formatters.date.korYmdHms(createdAt)}</div>;
      },
    },
  ];

  return (
    <DataTableServer data={items} columns={columns} totalItems={totalItems} />
  );
}
