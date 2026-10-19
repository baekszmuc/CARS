"use client";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page py-28 text-center">
      <h1 className="text-2xl font-bold">정보를 불러오지 못했습니다</h1>
      <p className="mt-3 text-graphite">잠시 후 다시 시도해 주세요.</p>
      <button type="button" className="btn btn-primary mt-8" onClick={reset}>다시 시도</button>
    </div>
  );
}
