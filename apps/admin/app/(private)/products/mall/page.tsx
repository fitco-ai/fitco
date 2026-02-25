import { getMalls } from '@/actions/malls/getMalls';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { commonCache } from '@/lib/search-params';
import type { SearchParams } from 'nuqs/server';
import MallsTable from './_components/malls-table';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await commonCache.parse(searchParams);
  return (
    <>
      <Header>
        <TopNav headings={[{ title: '쇼핑몰 상품 관리' }]} />
      </Header>
      <Main>
        <Table />
      </Main>
    </>
  );
}

async function Table() {
  const queryParams = commonCache.all();
  const response = await getMalls(queryParams);

  if (!response.ok || !response.data) {
    throw new Error('Error');
  }

  return (
    <MallsTable
      items={response.data.malls}
      totalItems={response.data.totalItems}
    />
  );
}
