import { ShoppingBag, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default async function RegisterSuccessPage({
  params,
}: {
  params: Promise<{ cafe24MallId: string }>;
}) {
  const { cafe24MallId } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* 성공 카드 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
          {/* 로고 */}
          <div className="mb-6">
            <Image
              src="/images/fitco_logo_204x101.png"
              width={204}
              height={101}
              alt="fitco"
              className="mx-auto h-auto w-32"
            />
          </div>

          {/* 성공 아이콘 */}
          <div className="mb-6">
            <h1 className="mb-2 font-bold text-2xl text-gray-900">
              회원가입 완료!
            </h1>
            <p className="text-gray-600">
              이제 {cafe24MallId} 쇼핑몰에서
              <br />
              fitcoai를 사용할 수 있습니다.
            </p>
          </div>

          {/* 기능 안내 */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">
                쇼핑몰 위젯에 탑재될 기능
              </h2>
            </div>
            <div className="space-y-3 text-gray-700 text-sm">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-blue-500" />
                <span>AI 기반 사이즈 추천</span>
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="font-medium text-blue-800 text-sm">
              🎉 이제 쇼핑몰에서 fitcoai를 사용할 수 있습니다!
            </p>
          </div>
        </div>

        {/* 하단 데코레이션 */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            <span>Powered by Fitco AI</span>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
