import { getProductDetailById } from '@/actions/products/getProductDetailById';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { notFound } from 'next/navigation';
import ProductInfo from './_components/product-info';
import ProductSpecifications from './_components/product-specifications';

export default async function ExternalProductDetailPage({
  params,
}: {
  params: Promise<{ mallId: string; productId: string }>;
}) {
  const { productId } = await params;

  const productResponse = await getProductDetailById(Number(productId));
  const product = productResponse.data?.product;

  if (!product) {
    notFound();
  }

  return (
    <>
      <Header>
        <TopNav
          headings={[
            { title: '외부 상품 관리', href: '/products/external' },
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
