import { getMembers } from '@/actions/members/getMembers';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { commonCache } from '@/lib/search-params';
import type { SearchParams } from 'nuqs/server';
import MembersTable from './_components/members-table';

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
  const response = await getMembers(queryParams);

  if (!response.ok || !response.data) {
    throw new Error('Error');
  }

  return (
    <MembersTable
      items={response.data.members}
      totalItems={response.data.totalItems}
    />
  );
}
