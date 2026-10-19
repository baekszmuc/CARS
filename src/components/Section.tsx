/** Aevum 레퍼런스: 가운데 정렬, 가벼운 굵기의 섹션 제목 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="mt-2 text-2xl font-normal tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-sm leading-relaxed text-graphite">{description}</p>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="bg-white">
      <div className="container-page grid gap-4 py-10 md:grid-cols-[1fr_minmax(0,24rem)] md:items-end">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-normal tracking-tight sm:text-4xl">{title}</h1>
        </div>
        {description && <p className="text-sm leading-relaxed text-graphite">{description}</p>}
      </div>
    </div>
  );
}
