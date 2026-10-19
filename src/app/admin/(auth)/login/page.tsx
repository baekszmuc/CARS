import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { LogoMark } from "@/components/LogoMark";

export const metadata: Metadata = { title: "관리자 로그인", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8">
        <LogoMark className="h-4 w-auto" />
        <h1 className="mt-3 text-sm font-semibold text-graphite">관리자 로그인</h1>
        <LoginForm />
      </div>
    </main>
  );
}
