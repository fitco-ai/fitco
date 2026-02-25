'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, type SessionProviderProps } from 'next-auth/react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useState } from 'react';

export default function Providers({ children, session }: SessionProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
}
