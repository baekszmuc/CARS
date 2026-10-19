export function Panel({
  title,
  description,
  actions,
  children,
  id,
}: {
  title?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="rounded-lg border border-silver bg-white p-5 sm:p-6">
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-bold">{title}</h2>}
            {description && <div className="mt-1 text-sm text-graphite">{description}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {actions}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "ok"; children: React.ReactNode }) {
  const cls = {
    info: "border-silver bg-white text-charcoal",
    warn: "border-[#f3d9a4] bg-[#fdf6e7] text-warn",
    ok: "border-[#bfe0cd] bg-[#eef8f2] text-ok",
  }[tone];
  return <div className={`rounded-md border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}
