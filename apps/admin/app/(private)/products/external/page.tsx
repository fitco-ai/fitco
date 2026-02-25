import { getExternalProducts } from '@/actions/products/getExternalProducts';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { commonCache } from '@/lib/search-params';
import type { SearchParams } from 'nuqs/server';
import ExternalProductsTable from './_components/external-products-table';

export default async function ExternalProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await commonCache.parse(searchParams);
  return (
    <>
      <Header>
        <TopNav headings={[{ title: '외부 상품 관리' }]} />
      </Header>
      <Main>
        <Table />
      </Main>
    </>
  );
}

async function Table() {
  const queryParams = commonCache.all();
  const response = await getExternalProducts(queryParams);

  if (!response.ok || !response.data) {
    throw new Error('Error');
  }

  return (
    <ExternalProductsTable
      items={response.data.products}
      totalItems={response.data.totalItems}
    />
  );
}
