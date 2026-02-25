import { getAiTokenUsages } from '@/actions/token-usage/getTokenUsages';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { aiTokenUsageCache } from '@/lib/search-params';
import type { SearchParams } from 'nuqs/server';
import TokenListTable from './_components/token-list-table';

export default async function TokenList({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await aiTokenUsageCache.parse(searchParams);
  return (
    <>
      <Header>
        <TopNav headings={[{ title: '토큰 사용 목록' }]} />
      </Header>
      <Main>
        <Table />
      </Main>
    </>
  );
}

async function Table() {
  const queryParams = aiTokenUsageCache.all();
  const response = await getAiTokenUsages(queryParams);

  if (!response.ok || !response.data) {
    throw new Error('Error');
  }

  return (
    <TokenListTable
      items={response.data.aiTokenUsages}
      totalItems={response.data.totalItems}
    />
  );
}
