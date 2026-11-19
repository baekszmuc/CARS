import { ko } from "@/i18n/ko";
import type { HandoverCategory, HandoverItem } from "@/lib/types";
import { getT } from "@/i18n/server";

const order: HandoverCategory[] = ["documents", "equipment", "keys"];

export async function HandoverList({ items, compact = false }: { items: HandoverItem[]; compact?: boolean }) {
  const { t } = await getT();
  return (
    <div className={`grid gap-5 ${compact ? "md:grid-cols-3" : "lg:grid-cols-3"}`}>
      {order.map((cat) => {
        const list = items.filter((i) => i.category === cat);
        const shown = compact ? list.slice(0, 4) : list;
        return (
          <section key={cat} className="bg-white p-5" aria-label={t(ko.handoverCategory[cat])}>
            <h3 className="font-bold">{t(ko.handoverCategory[cat])}</h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              {shown.map((i) => (
                <li key={i.id} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-obsidian" />
                  <span>
                    {t(i.label)}
                    {i.original_term && <span className="text-graphite"> ({i.original_term})</span>}
                  </span>
                </li>
              ))}
              {compact && list.length > shown.length && (
                <li className="text-graphite">{t("외 {n}개 항목", { n: list.length - shown.length })}</li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
