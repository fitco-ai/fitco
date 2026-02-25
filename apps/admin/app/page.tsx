import crypto from 'node:crypto';
import { getMallByCafe24MallId } from '@/actions/malls/getMallByCafe24MallId';
import { env } from '@/env';
import type { Cafe24InitSearchParamData } from '@/types';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import RegisterForm from './_components/register-form';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Cafe24InitSearchParamData>;
}) {
  const data = await searchParams;

  if (Object.keys(data).length === 0) {
    return redirect('/login');
  }

  const { isValid } = verifyHmac(data);

  if (!isValid) {
    throw new Error('Invalid hmac');
  }

  const mallResponse = await getMallByCafe24MallId(data.mall_id);

  if (!mallResponse.ok) {
    throw new Error('Failed to get mall');
  }

  const mall = mallResponse.data?.mall;

  if (mall) {
    return <Landing />;
  }

  return <RegisterForm cafe24MallId={data.mall_id} />;
}

function Landing() {
  return (
    <div className="relative flex h-screen flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-3">
        <Image
          src="/images/fitco_logo_204x101.png"
          alt="fitco"
          width={204}
          height={101}
          className="h-auto w-[102px] md:w-[204px]"
        />
        <div className="font-semibold leading-[100%] md:text-[28px] 2xl:text-[46px]">
          <h2>핏코</h2>
          <h3>말로하는 가상피팅</h3>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bottom-[200px] left-1/2">
        <p className="md:text-[28px] 2xl:text-[46px]">
          설치해주셔서 감사합니다.
        </p>
      </div>
    </div>
  );
}

function verifyHmac(searchParamObj: Cafe24InitSearchParamData) {
  const { hmac, ...others } = searchParamObj;
  const rawSearchParams = getRawSearchParams(others);

  const calculatedHmac = crypto
    .createHmac('sha256', env.CAFE24_SECRET_KEY)
    .update(rawSearchParams)
    .digest('base64');

  return {
    isValid: hmac === calculatedHmac,
  };
}

function getRawSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): string {
  if (!searchParams || Object.keys(searchParams).length === 0) {
    return '';
  }

  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      // 중복 key=value[] 형태도 모두 추가
      for (const v of value) {
        query.append(key, v);
      }
    } else if (typeof value === 'string') {
      query.append(key, value);
    }
  }

  return query.toString();
}
