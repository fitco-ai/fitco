import { getRecommendations } from '@/actions/recommendation/getRecommendations';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { commonCache } from '@/lib/search-params';
import type { SearchParams } from 'nuqs/server';
import RecommendationsTable from './_components/recommendations-table';

export default async function AiRecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await commonCache.parse(searchParams);
  return (
    <>
      <Header>
        <TopNav headings={[{ title: 'AI 추천 기록 조회' }]} />
      </Header>
      <Main>
        <Table />
      </Main>
    </>
  );
}

async function Table() {
  const queryParams = commonCache.all();
  const response = await getRecommendations(queryParams);

  if (!response.ok || !response.data) {
    throw new Error('Error');
  }

  return (
    <RecommendationsTable
      items={response.data.recommendations}
      totalItems={response.data.totalItems}
    />
  );
}
