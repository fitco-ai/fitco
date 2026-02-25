'use client';

import { updateSecret } from '@/actions/external-report-secret/updateSecret';
import { checkHashPassword } from '@/actions/malls/checkHashPassword';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PasswordForm({ mallHash }: { mallHash: string }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const response = await checkHashPassword(password, mallHash);

    if (!response.ok) {
      toast.error('비밀번호 검증에 실패했습니다. 관리자에게 문의하세요.');
      return;
    }

    const isValid = response.data?.isValid;

    if (!isValid) {
      toast.error('비밀번호가 올바르지 않습니다.');
      setIsLoading(false);
      return;
    }

    const secret = nanoid(16);

    const secretResponse = await updateSecret(mallHash, secret);

    const isCreated = secretResponse.data?.isCreated;

    if (!isCreated) {
      toast.error('비밀번호 확인에 실패했습니다. 관리자에게 문의하세요.');
      setIsLoading(false);
      return;
    }

    router.replace(`/external/reports/${mallHash}/content?secret=${secret}`);

    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="font-medium text-gray-700 text-sm"
          >
            비밀번호
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="pr-10"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-center text-red-600 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !password}
        >
          {isLoading ? '확인 중...' : '접근하기'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-500 text-xs">
          비밀번호는 관리자에게 문의하세요
        </p>
      </div>
    </>
  );
}
