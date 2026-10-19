"use client";
import { startTransition, useActionState, type FormEvent } from "react";

/**
 * useActionState + onSubmit 래퍼.
 * <form action>으로 연결하면 React가 제출 후 입력값을 초기화하므로,
 * 검증 오류가 나도 사용자가 입력한 값이 유지되도록 onSubmit으로 직접 디스패치한다.
 */
export function useFormAction<S extends object>(action: (prev: S, fd: FormData) => Promise<S>, initial: S) {
  const [state, dispatch, pending] = useActionState<S, FormData>(action, initial as Awaited<S>);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return [state, onSubmit, pending] as const;
}
