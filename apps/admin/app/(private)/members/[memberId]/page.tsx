import { getMemberById } from '@/actions/members/getMemberById';
import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import { notFound } from 'next/navigation';
import MemberInfo from './_components/member-info';
import MemberOrders from './_components/member-orders';

export default async function MemberDetailPage({
  params,
}: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  const response = await getMemberById(Number(memberId));
  const member = response.data?.member;

  if (!member) {
    notFound();
  }

  return (
    <>
      <Header>
        <TopNav
          headings={[
            { title: '사용자 관리', href: '/members' },
            { title: member.loginPhone ?? '비회원' },
          ]}
        />
      </Header>
      <Main>
        <div className="grid grid-cols-1 space-y-10">
          <MemberInfo memberId={Number(memberId)} />
          <MemberOrders memberId={Number(memberId)} />
        </div>
      </Main>
    </>
  );
}
