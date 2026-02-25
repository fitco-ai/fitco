import type { SidebarData } from '@/components/data/types';
import {
  ChartBarIcon,
  Command,
  CreditCardIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  ListIcon,
  MessageSquare,
  Package2Icon,
  PackageIcon,
  UsersIcon,
} from 'lucide-react';

export function useSidebarData() {
  return getSidebarData();
}

export function getSidebarData(): SidebarData {
  return {
    navGroups: [
      {
        title: '일반',
        items: [
          {
            title: '대시보드',
            href: '/dashboard',
            icon: LayoutDashboardIcon,
          },
        ],
      },
      {
        title: '쇼핑몰 관리',
        items: [
          {
            title: '쇼핑몰/위젯',
            href: '/malls',
            icon: Command,
          },
        ],
      },
      {
        title: '사용자/리뷰 관리',
        items: [
          {
            title: '사용자',
            href: '/members',
            icon: UsersIcon,
          },
          {
            title: '리뷰',
            href: '/reviews',
            icon: MessageSquare,
          },
        ],
      },
      {
        title: '상품관리',
        items: [
          {
            title: '쇼핑몰 상품',
            href: '/products/mall',
            icon: Package2Icon,
          },
          {
            title: '외부 상품',
            href: '/products/external',
            icon: PackageIcon,
          },
        ],
      },
      {
        title: 'AI',
        items: [
          {
            title: '추천 기록',
            href: '/ai/recommendations',
            icon: HistoryIcon,
          },
          {
            title: '토큰 사용량',
            href: '/ai/token-usage',
            icon: CreditCardIcon,
          },
          {
            title: '토큰 사용 목록',
            href: '/ai/token-list',
            icon: ListIcon,
          },
          {
            title: '프롬프트',
            href: '/ai/prompt',
            icon: MessageSquare,
          },
        ],
      },
      {
        title: '통계/리포트',
        items: [
          {
            title: '쇼핑몰별',
            href: '/reports/malls',
            icon: ChartBarIcon,
          },
        ],
      },
    ],
  };
}
