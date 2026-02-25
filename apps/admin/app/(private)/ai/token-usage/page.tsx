import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import RecommendationTokenTable from './_components/recommendation-token-table';
import TokenUsageChart from './_components/token-usage-chart';

export default function TokenUsagePage() {
  return (
    <>
      <Header>
        <TopNav headings={[{ title: '토큰 사용량' }]} />
      </Header>
      <Main>
        <div className="space-y-6">
          <TokenUsageChart />
          <RecommendationTokenTable />
        </div>
      </Main>
    </>
  );
}
