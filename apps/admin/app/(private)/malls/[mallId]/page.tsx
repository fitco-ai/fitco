import { getMallById } from '@/actions/malls/getMallById';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { notFound } from 'next/navigation';
import Connection from './_components/connection';
import MallInfo from './_components/mall-info';
import MallMemo from './_components/mall-memo';
import MallProvider from './_context';

export default async function MallDetailPage({
  params,
}: { params: Promise<{ mallId: string }> }) {
  const { mallId } = await params;
  const response = await getMallById(Number(mallId));
  const mall = response.data?.mall;

  if (!mall) {
    notFound();
  }

  return (
    <MallProvider mallId={Number(mallId)}>
      <Header>
        <TopNav
          headings={[
            { title: '쇼핑몰/위젯', href: '/malls' },
            { title: mall.cafe24MallId },
          ]}
        />
      </Header>
      <Main>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 쇼핑몰 기본정보 */}
          <MallInfo mallId={Number(mallId)} />

          {/* 쇼핑몰 메모 */}
          <MallMemo mallId={Number(mallId)} />

          {/* 쇼핑몰 연동 관리 카드 */}
          <div className="lg:col-span-2">
            <Connection mallId={Number(mallId)} />
          </div>
        </div>
      </Main>
    </MallProvider>
  );
}
