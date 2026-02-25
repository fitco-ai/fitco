'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type LoginFormValue = {
  login: string;
  password: string;
};

export default function LoginForm() {
  const { handleSubmit, register } = useForm<LoginFormValue>();
  const router = useRouter();

  const _handleSubmit = async (data: LoginFormValue) => {
    const { login, password } = data;
    const result = await signIn('credentials', {
      login,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error(result?.error);
    } else {
      toast.success('로그인에 성공했습니다.');
      router.replace('/dashboard');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(_handleSubmit)}
      className="flex flex-col gap-5"
    >
      <Input {...register('login')} placeholder="아이디를 입력해주세요." />
      <Input
        {...register('password')}
        placeholder="비밀번호를 입력해주세요."
        type="password"
      />
      <Button type="submit" className="w-full bg-black hover:bg-black/80">
        로그인
      </Button>
    </form>
  );
}
