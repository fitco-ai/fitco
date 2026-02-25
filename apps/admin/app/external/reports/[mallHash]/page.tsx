import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Lock } from 'lucide-react';
import PasswordForm from './_components/password-form';

export default async function ExternalReportPasswordPage({
  params,
}: { params: Promise<{ mallHash: string }> }) {
  const { mallHash } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="pb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="font-bold text-2xl text-gray-900">
            외부 리포트 접근
          </CardTitle>
          <p className="mt-2 text-gray-600">
            리포트를 보려면 비밀번호를 입력해주세요
          </p>
        </CardHeader>

        <CardContent>
          <PasswordForm mallHash={mallHash} />
        </CardContent>
      </Card>
    </div>
  );
}
