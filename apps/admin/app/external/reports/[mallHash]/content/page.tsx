import { checkSecret } from '@/actions/external-report-secret/checkSecret';
import { getMallById } from '@/actions/malls/getMallById';
import { IdCodec } from '@/actions/utils';
import { notFound } from 'next/navigation';
import { BoardCountCard } from './_components/board-count-card';
import { CartRateCard } from './_components/cart-rate-card';
import { ClickRateCard } from './_components/click-rate-card';
import { ExitPageCard } from './_components/exit-page-card';
import { ProductCountCard } from './_components/product-count-card';
import { ProductRefundRateCard } from './_components/product-refund-rate-card';
import ProductSalesCard from './_components/product-sales-card';
import { ProductSettleCountCard } from './_components/product-settle-count-card';
import { ResultRateCard } from './_components/result-rate-card';
import { ReviewCountCard } from './_components/review-count-card';
import ShopSelect from './_components/shop-select';
import ExternalMallReportProvider from './_context';

export default async function ExternalReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ mallHash: string }>;
  searchParams: Promise<{ secret: string }>;
}) {
  const { mallHash } = await params;
  const { secret } = await searchParams;
  const mallId = IdCodec.mall.decode(mallHash);

  const secretResponse = await checkSecret(mallId, secret);

  if (!secretResponse.data?.isAuthorized) {
    throw new Error('Invalid secret');
  }

  const response = await getMallById(Number(mallId));
  const mall = response.data?.mall;

  if (!mall) {
    notFound();
  }

  return (
    <ExternalMallReportProvider>
      <div className="mx-auto max-w-[1400px] px-4 py-20">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div>
              <h1 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
                {mall.cafe24MallId}
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                쇼핑몰 성과 분석 리포트
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between">
          <ShopSelect mallId={Number(mallId)} />
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

        {/* 푸터 정보 */}
        <div className="mt-12 border-gray-200 border-t pt-8">
          <div className="text-center text-gray-500 text-sm">
            <p>생성일: {new Date().toLocaleDateString('ko-KR')}</p>
            <p className="mt-1">
              이 리포트는 자동으로 생성되었으며, 실시간 데이터를 기반으로
              합니다.
            </p>
          </div>
        </div>
      </div>
    </ExternalMallReportProvider>
  );
}
