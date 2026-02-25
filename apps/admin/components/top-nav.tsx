import type { PageHeaderItem } from '@/types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components/ui/breadcrumb';
import Link from 'next/link';
import { Fragment } from 'react';

export function TopNav({
  headings,
}: {
  headings: PageHeaderItem[];
}) {
  return (
    <div className="sticky top-0 z-50 h-16 shrink-0 bg-background pr-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex h-full w-full max-w-[1800px] items-center justify-between gap-2 px-4">
        <Breadcrumb>
          <BreadcrumbList>
            {headings.map((heading, index) =>
              index === headings.length - 1 ? (
                <BreadcrumbItem key={heading.title + index}>
                  <BreadcrumbPage>{heading.title}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <Fragment key={heading.title + index}>
                  <BreadcrumbItem className="hidden md:block">
                    {heading.href ? (
                      <Link href={heading.href} className="hover:underline">
                        {heading.title}
                      </Link>
                    ) : (
                      <span>{heading.title}</span>
                    )}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </Fragment>
              )
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
