import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
      <Link href="/" className="btn btn-primary mt-8">홈으로</Link>
    </div>
  );
}
