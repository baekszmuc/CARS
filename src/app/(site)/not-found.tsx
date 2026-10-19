import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-graphite">차량이 게시 중단되었거나 주소가 변경되었을 수 있습니다.</p>
      <Link href="/vehiculos" className="btn btn-primary mt-8">전체 차량 보기</Link>
    </div>
  );
}
