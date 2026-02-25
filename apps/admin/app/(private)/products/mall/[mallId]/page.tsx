import { getMallById } from '@/actions/malls/getMallById';
import { getMallProducts } from '@/actions/products/getMallProducts';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { productsCache } from '@/lib/search-params';
import { notFound } from 'next/navigation';
import type { SearchParams } from 'nuqs/server';
import ProductsTable from './_components/products-table';

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ mallId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { mallId } = await params;
  await productsCache.parse(searchParams);

  const mallResponse = await getMallById(Number(mallId));
  const mall = mallResponse.data?.mall;

  if (!mall) {
    notFound();
  }

  return (
    <>
      <Header>
        <TopNav
          headings={[
            { title: '쇼핑몰 상품 관리', href: '/products/mall' },
            { title: mall.cafe24MallId },
          ]}
        />
      </Header>
      <Main>
        <Table mallId={Number(mallId)} />
      </Main>
    </>
  );
}

async function Table({ mallId }: { mallId: number }) {
  const queryParams = productsCache.all();

  const response = await getMallProducts(mallId, queryParams);

  if (!response.ok || !response.data) {
    throw new Error('Error');
  }

  return (
    <ProductsTable
      mallId={mallId}
      items={response.data.products}
      totalItems={response.data.totalItems}
    />
  );
}
