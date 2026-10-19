import { ImageResponse } from "next/og";
import { getPublishedVehicle, getSettings } from "@/lib/data";
import { formatMoney, priceBreakdown, vehicleTitle } from "@/lib/format";

export const revalidate = 300;

const unitEs = { day: "día", week: "semana", month: "mes", year: "año" } as const;

/**
 * 차량 사진이 아직 없을 때 SNS 공유용으로 쓰는 텍스트 카드 이미지 (1200×630).
 * 기본 폰트는 한글을 지원하지 않으므로 라틴 문자만 사용한다.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [vehicle, settings] = await Promise.all([getPublishedVehicle(slug), getSettings()]);
  if (!vehicle) return new Response("Not found", { status: 404 });
  const p = priceBreakdown(vehicle);
  const cur = settings.currency;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#121417",
          color: "#ffffff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 8 }}>{settings.business_name.toUpperCase()}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800 }}>{vehicleTitle(vehicle)}</div>
          <div style={{ fontSize: 40, color: "#E9EAED", marginTop: 16 }}>
            {p.ivaApplies
              ? `${formatMoney(p.base, cur)} + IVA  ·  ${formatMoney(p.total, cur)} IVA incl. / ${unitEs[p.unit]}`
              : `${formatMoney(p.base, cur)} / ${unitEs[p.unit]}`}
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#8a8e96" }}>Paraguay</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
