import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>Fitco AI</h2>
      <p>페이지를 찾을 수 없습니다.</p>
      <Link href="/">홈으로 이동</Link>
    </div>
  );
}
