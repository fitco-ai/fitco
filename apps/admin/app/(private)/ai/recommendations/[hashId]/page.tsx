import { IdCodec } from '@/actions/utils';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import RecommendationDetail from './_components/recommendation-detail';

export default async function AiRecommendationDetailPage({
  params,
}: {
  params: Promise<{ hashId: string }>;
}) {
  const { hashId } = await params;
  const id = IdCodec.recommendation.decode(hashId);

  return (
    <>
      <Header>
        <TopNav
          headings={[
            { title: 'AI 추천 기록 조회', href: '/ai/recommendations' },
            { title: hashId },
          ]}
        />
      </Header>
      <Main>
        <RecommendationDetail recommendationId={id} />
      </Main>
    </>
  );
}
