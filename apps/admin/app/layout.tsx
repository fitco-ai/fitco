import { DesignSystemProvider } from '@repo/design-system';
import { pretendard } from '@repo/design-system/lib/fonts';
import './styles.css';
import { auth } from '@/lib/auth';
import Providers from '@/providers/provider';
import NextTopLoader from 'nextjs-toploader';
import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProperties) {
  const session = await auth();

  return (
    <html lang="ko" className={pretendard.className} suppressHydrationWarning>
      <body>
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>
          <DesignSystemProvider forcedTheme="light" enableSystem={false}>
            {children}
          </DesignSystemProvider>
        </Providers>
      </body>
    </html>
  );
}
