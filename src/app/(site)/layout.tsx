import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSettings, logoUrl } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-2">
        본문으로 건너뛰기
      </a>
      <SiteHeader name={settings.business_name} logoUrl={logoUrl(settings)} />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
