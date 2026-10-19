import Link from "next/link";
import { InquiryStatusForm } from "@/components/admin/InquiryStatusForm";
import { PageTitle } from "@/components/admin/ui";
import { ko } from "@/i18n/ko";
import { getAdminContext } from "@/lib/admin";
import { formatDate, formatDateTime } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import type { Inquiry, InquiryStatus } from "@/lib/types";

export const metadata = { title: "고객 문의" };

type Props = { searchParams: Promise<{ estado?: string }> };
const statuses = Object.keys(ko.inquiryStatus) as InquiryStatus[];

export default async function InquiriesPage({ searchParams }: Props) {
  const { estado } = await searchParams;
  const filter = statuses.includes(estado as InquiryStatus) ? (estado as InquiryStatus) : null;
  const { supabase } = await getAdminContext();
  let query = supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(500);
  if (filter) query = query.eq("status", filter);
  const [{ data }, { data: all }] = await Promise.all([query, supabase.from("inquiries").select("status")]);
  const inquiries = (data ?? []) as Inquiry[];
  const counts = new Map<string, number>();
  (all ?? []).forEach((r: { status: string }) => counts.set(r.status, (counts.get(r.status) ?? 0) + 1));

  return (
    <div>
      <PageTitle title="고객 문의" />
      <nav aria-label="상태 필터" className="mb-5 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/consultas" className={`rounded-full border px-3 py-1 ${!filter ? "border-obsidian bg-obsidian text-white" : "border-silver bg-white"}`}>
          전체 {all?.length ?? 0}
        </Link>
        {statuses.map((s) => (
          <Link key={s} href={`/admin/consultas?estado=${s}`}
            className={`rounded-full border px-3 py-1 ${filter === s ? "border-obsidian bg-obsidian text-white" : "border-silver bg-white"}`}>
            {ko.inquiryStatus[s]} {counts.get(s) ?? 0}
          </Link>
        ))}
      </nav>
      {inquiries.length === 0 ? (
        <p className="rounded-lg border border-silver bg-white p-6 text-sm text-graphite">해당하는 문의가 없습니다.</p>
      ) : (
        <ul className="grid gap-3">
          {inquiries.map((i) => {
            const wa = whatsappLink(i.phone, `안녕하세요 ${i.name}님, BS CARS입니다. 렌탈 문의 관련하여 연락드립니다.`);
            return (
              <li key={i.id} className="grid gap-4 rounded-lg border border-silver bg-white p-5 lg:grid-cols-[1fr_320px]" data-testid="inquiry-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold">{i.name}</p>
                    <span className="rounded bg-mist px-2 py-0.5 text-xs font-semibold">{ko.inquiryStatus[i.status]}</span>
                    <span className="text-xs text-graphite">{formatDateTime(i.created_at)} 접수</span>
                  </div>
                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                    <div><dt className="inline text-graphite">전화: </dt><dd className="inline font-semibold"><a href={`tel:${i.phone.replace(/[^0-9+]/g, "")}`}>{i.phone}</a></dd></div>
                    <div><dt className="inline text-graphite">이메일: </dt><dd className="inline">{i.email ?? "-"}</dd></div>
                    <div><dt className="inline text-graphite">관심 차량: </dt><dd className="inline font-semibold">{i.vehicle_name ?? "미정"}</dd></div>
                    <div><dt className="inline text-graphite">희망 기간: </dt><dd className="inline">{formatDate(i.pickup_date)} ~ {formatDate(i.return_date)}</dd></div>
                  </dl>
                  {i.message && <p className="mt-3 whitespace-pre-line rounded-md bg-mist p-3 text-sm">{i.message}</p>}
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm underline">
                      WhatsApp으로 고객에게 연락 (번호가 국가번호 포함 형식일 때만 정확)
                    </a>
                  )}
                </div>
                <InquiryStatusForm inquiry={i} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
