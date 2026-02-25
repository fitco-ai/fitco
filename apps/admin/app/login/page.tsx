import LoginForm from '@/components/form/login-form';
import { Card } from '@repo/design-system/components/ui/card';
import Image from 'next/image';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
        <div className="mb-4 flex items-center justify-center">
          <Image
            src="/images/fitco_logo_204x101.png"
            width={204}
            height={101}
            alt="Fitco"
            className="scale-50"
          />
        </div>
        <Card className="p-6">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
