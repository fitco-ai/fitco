import { getReviews } from '@/actions/reviews/getReviews';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { commonCache } from '@/lib/search-params';
import type { SearchParams } from 'nuqs/server';
import ReviewsTable from './_components/reviews-table';

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await commonCache.parse(searchParams);
  return (
    <>
      <Header>
        <TopNav headings={[{ title: '사용자 관리' }]} />
      </Header>
      <Main>
        <Table />
      </Main>
    </>
  );
}

async function Table() {
  const queryParams = commonCache.all();
  const response = await getReviews(queryParams);

  if (!response.ok || !response.data) {
    throw new Error('Error');
  }

  return (
    <ReviewsTable
      items={response.data.reviews}
      totalItems={response.data.totalItems}
    />
  );
}
