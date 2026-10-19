"use client";
import { useState, useTransition } from "react";

/** 서버 액션을 실행하는 버튼. confirm 문구가 있으면 실행 전에 확인한다. */
export function ActionButton({
  action,
  children,
  confirm,
  className = "btn btn-outline btn-sm",
  testId,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  confirm?: string;
  className?: string;
  testId?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        className={className}
        disabled={pending}
        data-testid={testId}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          setError(null);
          start(async () => {
            try {
              await action();
            } catch (e) {
              // redirect()는 예외로 전달되므로 다시 던진다
              if (e && typeof e === "object" && "digest" in e && String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw e;
              setError(e instanceof Error ? e.message : "작업에 실패했습니다.");
            }
          });
        }}
      >
        {pending ? "처리 중…" : children}
      </button>
      {error && <span className="mt-1 text-xs text-danger" role="alert">{error}</span>}
    </span>
  );
}
