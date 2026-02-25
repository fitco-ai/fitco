'use client';

import { useSidebarData } from '@/hooks/use-sidebar-data';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@repo/design-system/components/ui/sidebar';
import { SidebarNavGroup } from './nav-group';
import { TeamSwitcher } from './team-switcher';

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const sidebarData = useSidebarData();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <SidebarNavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
