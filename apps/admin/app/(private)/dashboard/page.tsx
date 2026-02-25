import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { CartRateCard } from './_components/cart-rate-card';
import { ClickRateCard } from './_components/click-rate-card';
import { ExitPageCard } from './_components/exit-page-card';
import { MallChartCard } from './_components/mall-chart-card';
import { ProductCountCard } from './_components/product-count-card';
import { RecommendationChartCard } from './_components/recommendation-chart-card';
import { ResultRateCard } from './_components/result-rate-card';
import { ReviewCountCard } from './_components/review-count-card';

export default function DashboardPage() {
  return (
    <>
      <Header>
        <TopNav headings={[{ title: '대시보드' }]} />
      </Header>
      <Main>
        <div className="space-y-6">
          {/* 차트 카드들 */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6">
              <MallChartCard />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <RecommendationChartCard />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <ClickRateCard />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <ResultRateCard />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <CartRateCard />
            </div>
            <div className="col-span-12 md:col-span-6">
              <ProductCountCard />
            </div>
            <div className="col-span-12 md:col-span-6">
              <ReviewCountCard />
            </div>
            <div className="col-span-12">
              <ExitPageCard />
            </div>
          </div>
        </div>
      </Main>
    </>
  );
}
