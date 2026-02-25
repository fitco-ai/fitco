import { getMallById } from '@/actions/malls/getMallById';
import { IdCodec } from '@/actions/utils';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { notFound } from 'next/navigation';
import { BoardCountCard } from './_components/board-count-card';
import { CartRateCard } from './_components/cart-rate-card';
import { ClickRateCard } from './_components/click-rate-card';
import CopyLinkButton from './_components/copy-link-button';
import { ExitPageCard } from './_components/exit-page-card';
import { ProductCountCard } from './_components/product-count-card';
import { ProductRefundRateCard } from './_components/product-refund-rate-card';
import ProductSalesCard from './_components/product-sales-card';
import { ProductSettleCountCard } from './_components/product-settle-count-card';
import { ResultRateCard } from './_components/result-rate-card';
import { ReviewCountCard } from './_components/review-count-card';
import ShopSelect from './_components/shop-select';
import MallReportProvider from './_context';

export default async function MallReportDetailPage({
  params,
}: { params: Promise<{ mallId: string }> }) {
  const { mallId } = await params;
  const response = await getMallById(Number(mallId));
  const mall = response.data?.mall;

  if (!mall) {
    notFound();
  }

  const mallHash = IdCodec.mall.encode(Number(mallId));

  return (
    <>
      <Header>
        <TopNav
          headings={[
            { title: '쇼핑몰별 리포트', href: '/reports/malls' },
            { title: mall.cafe24MallId },
          ]}
        />
      </Header>
      <Main>
        <MallReportProvider>
          <div className="mb-6 flex justify-between">
            <ShopSelect mallId={Number(mallId)} />
            <CopyLinkButton mallHash={mallHash} />
          </div>
          {/* 차트 카드들 */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <ProductSalesCard mallId={Number(mallId)} />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <ClickRateCard mallId={Number(mallId)} />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <ResultRateCard mallId={Number(mallId)} />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <CartRateCard mallId={Number(mallId)} />
            </div>
            <div className="col-span-12 md:col-span-6">
              <ProductCountCard mallId={Number(mallId)} />
            </div>
            <div className="col-span-12 md:col-span-6">
              <ReviewCountCard mallId={Number(mallId)} />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <ProductRefundRateCard mallId={Number(mallId)} />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <ProductSettleCountCard mallId={Number(mallId)} />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <BoardCountCard mallId={Number(mallId)} />
            </div>
            <div className="col-span-12">
              <ExitPageCard mallId={Number(mallId)} />
            </div>
          </div>
        </MallReportProvider>
      </Main>
    </>
  );
}
