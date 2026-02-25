import { getMallById } from '@/actions/malls/getMallById';
import { getProductDetailById } from '@/actions/products/getProductDetailById';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { notFound } from 'next/navigation';
import ProductInfo from './_components/product-info';
import ProductSpecifications from './_components/product-specifications';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ mallId: string; productId: string }>;
}) {
  const { mallId, productId } = await params;

  const mallResponse = await getMallById(Number(mallId));
  const productResponse = await getProductDetailById(Number(productId));
  const mall = mallResponse.data?.mall;
  const product = productResponse.data?.product;

  if (!mall || !product) {
    notFound();
  }

  return (
    <>
      <Header>
        <TopNav
          headings={[
            { title: '쇼핑몰 상품 관리', href: '/products/mall' },
            { title: mall.cafe24MallId, href: `/products/mall/${mall.id}` },
            { title: product.productName ?? '이름 없음' },
          ]}
        />
      </Header>
      <Main>
        <div className="space-y-6">
          <ProductInfo productId={Number(productId)} />
          <ProductSpecifications productId={Number(productId)} />
        </div>
      </Main>
    </>
  );
}
