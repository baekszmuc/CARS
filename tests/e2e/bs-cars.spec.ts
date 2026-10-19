import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { ANON_KEY, SUPABASE_URL, login, money } from "./helpers";

test.describe.configure({ mode: "serial" });

const INITIAL = [
  { slug: "tivoli-2023", title: "Tivoli 2023", base: 800, iva: 80, total: 880, year: "2023", km: "25,000 km" },
  { slug: "kia-seltos", title: "Kia Seltos 2027", base: 900, iva: 90, total: 990, year: "2027", km: "0 km" },
  { slug: "tucson", title: "Tucson 2026", base: 1100, iva: 110, total: 1210, year: "2026", km: "0 km" },
];

const TEST_NAME = `E2E Prueba ${Date.now().toString(36)}`;
let testVehicleAdminUrl = "";
let testVehicleSlug = "";
let duplicateAdminUrl = "";

async function cardFor(page: Page, title: string) {
  const esc = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return page.getByTestId("vehicle-card").filter({ has: page.getByRole("heading", { name: new RegExp(`(^| )${esc}$`) }) });
}

test("1. BS CARS 웹사이트가 정상적으로 열린다", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("BS CARS 차량 옵션");
  // 제품 우선: 첫 화면에 차량 카드 3개와 상세/문의 버튼
  await expect(page.getByTestId("vehicle-card")).toHaveCount(3);
  await expect(page.getByTestId("vehicle-card").first()).toBeInViewport();
  await expect(page.getByTestId("vehicle-card").first().getByRole("link", { name: "상세 정보" })).toBeVisible();
  await expect(page.getByTestId("comparison-table")).toBeVisible();
  await expect(page.getByRole("heading", { name: "렌트료에 포함된 서비스" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "차량 인수 시 함께 제공되는 항목" })).toBeVisible();
  for (const p of ["/vehiculos", "/servicios", "/incluye", "/contacto", "/privacidad"]) {
    expect((await page.goto(p))?.status(), p).toBe(200);
  }
});

test("2·3. 초기 차량 3종이 정확한 가격으로 표시되고 IVA 합계가 일치한다", async ({ page }) => {
  await page.goto("/vehiculos");
  for (const v of INITIAL) {
    const card = await cardFor(page, v.title);
    await expect(card).toHaveCount(1);
    await expect(card.getByTestId("price-base")).toHaveText(`USD ${v.base.toLocaleString("en-US")} / 월`);
    await expect(card).toContainText(`OPTION 0${INITIAL.indexOf(v) + 1}`);
    await expect(card.getByTestId("price-iva")).toHaveText(`USD ${v.iva.toLocaleString("en-US")}`);
    await expect(card.getByTestId("price-total")).toHaveText(`USD ${v.total.toLocaleString("en-US")} / 월`);
    const base = money(await card.getByTestId("price-base").innerText());
    const iva = money(await card.getByTestId("price-iva").innerText());
    const total = money(await card.getByTestId("price-total").innerText());
    expect(base + iva).toBe(total);
  }
  // 비교표
  const table = page.getByTestId("comparison-table");
  await expect(table).toBeVisible();
  const text = await table.innerText();
  for (const v of INITIAL) {
    expect(text).toContain(v.title);
    expect(text).toContain(`USD ${v.total.toLocaleString("en-US")}`);
  }
  expect(text).toContain("25,000 km");
  expect(text).toContain("1.5 CRDi 터보 디젤");
  expect(text).toContain("자동 8단");
  // 상세 페이지 가격
  for (const v of INITIAL) {
    await page.goto(`/vehiculos/${v.slug}`);
    await expect(page.getByTestId("vehicle-title")).toHaveText(v.title);
    await expect(page.getByRole("heading", { name: "차량 사양" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "다른 차량 옵션" })).toBeVisible();
    await expect(page.getByTestId("vehicle-main").getByTestId("price-total")).toContainText(`USD ${v.total.toLocaleString("en-US")}`);
  }
});

test("8. 관리자 로그인 없이 차량 정보를 변경할 수 없다", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/vehiculos");
  await expect(page).toHaveURL(/\/admin\/login$/);

  const headers = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
  // anon 키로 가격 변경 시도 → RLS로 0행 변경
  const patch = await request.patch(`${SUPABASE_URL}/rest/v1/vehicles?slug=eq.tucson`, { headers, data: { base_price: 1 } });
  expect(await patch.json()).toEqual([]);
  const del = await request.delete(`${SUPABASE_URL}/rest/v1/vehicles?slug=eq.tucson`, { headers });
  expect(await del.json()).toEqual([]);
  // anon 키로 고객 문의 열람 시도 → 거부
  const inq = await request.get(`${SUPABASE_URL}/rest/v1/inquiries?select=*`, { headers });
  expect(inq.ok()).toBeFalsy();
  // 설정 변경 시도 → 0행
  const st = await request.patch(`${SUPABASE_URL}/rest/v1/settings?id=eq.1`, { headers, data: { business_name: "HACK" } });
  expect(await st.json()).toEqual([]);
  // anon 사진 업로드 시도 → 거부
  const up = await request.post(`${SUPABASE_URL}/storage/v1/object/vehicle-photos/hack/x.png`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "image/png" },
    data: Buffer.from("x"),
  });
  expect(up.ok()).toBeFalsy();

  await page.goto("/vehiculos/tucson");
  await expect(page.getByTestId("vehicle-main").getByTestId("price-base")).toContainText("USD 1,100");
});

test("4. 차량 등록 시 고유 URL이 자동 생성되고 중복 시 식별자가 붙는다", async ({ page }) => {
  await login(page);
  await page.goto("/admin/vehiculos/nuevo");
  await page.getByLabel("차량명 *").fill(TEST_NAME);
  await page.getByLabel("연식").fill("2024");
  await page.getByLabel("주행거리 (km)").fill("1200");
  await page.getByLabel(/기본 렌트료/).fill("700");
  await page.getByLabel("고객용 사이트에 게시").check();
  await page.getByRole("button", { name: "차량 등록" }).click();
  await expect(page.getByText("차량이 등록되었습니다")).toBeVisible();
  testVehicleAdminUrl = page.url().replace(/\?.*$/, "");
  const url = await page.getByTestId("admin-vehicle-url").innerText();
  const expectedSlug = TEST_NAME.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-2024";
  expect(url).toBe(`http://localhost:3000/vehiculos/${expectedSlug}`);
  testVehicleSlug = expectedSlug;

  // 같은 이름+연식으로 다시 등록 → 고유 식별자 추가
  await page.goto("/admin/vehiculos/nuevo");
  await page.getByLabel("차량명 *").fill(TEST_NAME);
  await page.getByLabel("연식").fill("2024");
  await page.getByLabel(/기본 렌트료/).fill("700");
  await page.getByRole("button", { name: "차량 등록" }).click();
  await expect(page.getByText("차량이 등록되었습니다")).toBeVisible();
  duplicateAdminUrl = page.url().replace(/\?.*$/, "");
  const dupUrl = await page.getByTestId("admin-vehicle-url").innerText();
  expect(dupUrl).toMatch(new RegExp(`/vehiculos/${expectedSlug}-[0-9a-f]{6}$`));
});

test("5·14. 차량 링크가 상세 페이지를 열고, 직접 입력·새로고침해도 정상 작동한다", async ({ page }) => {
  const res = await page.goto(`/vehiculos/${testVehicleSlug}`);
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId("vehicle-title")).toHaveText(`${TEST_NAME} 2024`);
  await expect(page.getByTestId("vehicle-main").getByTestId("price-total")).toContainText("USD 770");
  await page.reload();
  await expect(page.getByTestId("vehicle-title")).toHaveText(`${TEST_NAME} 2024`);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", new RegExp(TEST_NAME));
  // 카탈로그에도 노출
  await page.goto("/vehiculos");
  await expect(await cardFor(page, `${TEST_NAME} 2024`)).toHaveCount(1);
});

test("6. 링크 복사 버튼이 정상 작동한다", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/vehiculos/kia-seltos");
  await page.getByRole("button", { name: "링크 복사" }).first().click();
  await expect(page.getByRole("button", { name: "복사되었습니다" }).first()).toBeVisible();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toBe("http://localhost:3000/vehiculos/kia-seltos");
});

test("7. WhatsApp 메시지에 올바른 차량 정보와 링크가 들어간다", async ({ page }) => {
  // 번호 미등록 상태: 잘못된 링크 대신 안내 문구
  await page.goto("/vehiculos/kia-seltos");
  await expect(page.getByTestId("vehicle-main").getByTestId("whatsapp-missing")).toBeVisible();
  await expect(page.getByTestId("vehicle-main").getByTestId("whatsapp-link")).toHaveCount(0);

  await login(page);
  await page.goto("/admin/configuracion");
  await page.getByLabel("WhatsApp 번호").fill("+595 981 000 000");
  await page.getByRole("button", { name: "설정 저장" }).click();
  await expect(page.getByTestId("form-message")).toHaveText("설정이 저장되었습니다.");

  await page.goto("/vehiculos/kia-seltos");
  const href = await page.getByTestId("vehicle-main").getByTestId("whatsapp-link").getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/595981000000\?text=/);
  const msg = decodeURIComponent(href!.split("?text=")[1]);
  expect(msg).toBe(
    [
      "안녕하세요. BS CARS 차량 렌탈에 대해 문의드립니다.",
      "관심 차량: Kia Seltos 2027",
      "월 렌트료: USD 900 + IVA",
      "IVA 포함 가격: USD 990",
      "차량의 이용 가능 여부와 렌탈 조건을 안내해 주실 수 있을까요?",
      "차량 상세 링크: http://localhost:3000/vehiculos/kia-seltos",
    ].join("\n"),
  );

  // 원상 복구 (실제 번호는 운영자가 등록)
  await page.goto("/admin/configuracion");
  await page.getByLabel("WhatsApp 번호").fill("");
  await page.getByRole("button", { name: "설정 저장" }).click();
  await expect(page.getByTestId("form-message")).toHaveText("설정이 저장되었습니다.");
});

test("9. 차량 가격 변경이 고객용 사이트에 반영된다", async ({ page }) => {
  await login(page);
  await page.goto(testVehicleAdminUrl);
  await page.getByLabel(/기본 렌트료/).fill("750");
  await page.getByRole("button", { name: "변경 사항 저장" }).click();
  await expect(page.getByTestId("form-message")).toContainText("저장되었습니다");

  await page.goto(`/vehiculos/${testVehicleSlug}`);
  await expect(page.getByTestId("vehicle-main").getByTestId("price-base")).toContainText("USD 750");
  await expect(page.getByTestId("vehicle-main").getByTestId("price-iva")).toHaveText("USD 75");
  await expect(page.getByTestId("vehicle-main").getByTestId("price-total")).toContainText("USD 825");
  await page.goto("/vehiculos");
  await expect((await cardFor(page, `${TEST_NAME} 2024`)).getByTestId("price-total")).toContainText("USD 825");
});

test("10. 사진 업로드가 정상 작동한다", async ({ page }) => {
  await login(page);
  await page.goto(testVehicleAdminUrl);
  // 잘못된 형식 거부
  await page.getByTestId("photo-input").setInputFiles(path.join(__dirname, "../fixtures/not-image.txt"));
  await expect(page.getByTestId("photo-message")).toContainText("형식만 업로드할 수 있습니다");
  // 정상 업로드
  await page.getByTestId("photo-input").setInputFiles(path.join(__dirname, "../fixtures/test-photo.png"));
  await expect(page.getByTestId("photo-message")).toContainText("1장 업로드 완료");
  await expect(page.getByTestId("photo-list").locator("li")).toHaveCount(1);
  await expect(page.getByTestId("photo-list").getByText("대표 사진", { exact: true })).toBeVisible();
  // 두 번째 사진 → 순서 변경 및 대표 설정
  await page.getByTestId("photo-input").setInputFiles(path.join(__dirname, "../fixtures/test-photo.png"));
  await expect(page.getByTestId("photo-list").locator("li")).toHaveCount(2);
  await page.getByRole("button", { name: "대표로 설정" }).click();
  await expect(page.getByTestId("photo-list").locator("li").nth(1).getByText("대표 사진", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "앞으로 이동" }).nth(1).click();
  await expect(page.getByTestId("photo-list").locator("li").nth(0).getByText("대표 사진", { exact: true })).toBeVisible();

  // 참고 이미지 표시
  await page.getByTestId("photo-list").locator("li").first().getByLabel(/참고 이미지/).check();
  await expect(page.getByTestId("photo-list").locator("li").first().getByLabel(/참고 이미지/)).toBeChecked();

  // 고객 페이지에 실제 사진 표시
  await page.goto(`/vehiculos/${testVehicleSlug}`);
  const img = page.locator("article img").first();
  await expect(img).toBeVisible();
  const ok = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
  expect(ok).toBeTruthy();
  await expect(page.getByTestId("reference-note")).toBeVisible();
  await expect(page.getByText("참고 이미지", { exact: true }).first()).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /storage\/v1\/object\/public\/vehicle-photos\//);
});

test("11·14. 고객 문의가 DB에 저장되고 상태 변경이 유지된다", async ({ page }) => {
  const name = `테스트 고객 ${Date.now()}`;
  await page.goto("/contacto?vehiculo=tucson");
  await expect(page.getByLabel("관심 차량")).toHaveValue(/[0-9a-f-]{36}/);
  // 검증 오류
  await page.getByRole("button", { name: "문의 보내기" }).click();
  await expect(page.getByText("이름을 입력해 주세요.")).toBeVisible();
  await page.getByLabel("이름 *").fill(name);
  await page.getByLabel("전화번호 *").fill("+595 981 123 456");
  await page.getByLabel("이메일 (선택)").fill("cliente@example.com");
  await page.getByLabel("희망 인수일").fill("2030-01-10");
  await page.getByLabel("희망 반납일").fill("2030-01-05");
  await page.getByLabel("추가 문의사항").fill("월 렌탈 조건이 궁금합니다.");
  await page.getByLabel(/개인정보 수집·이용에 동의합니다/).check();
  await page.getByRole("button", { name: "문의 보내기" }).click();
  await expect(page.getByText("희망 반납일은 희망 인수일 이후여야 합니다.")).toBeVisible();
  await page.getByLabel("희망 반납일").fill("2030-02-10");
  await page.getByRole("button", { name: "문의 보내기" }).click();
  await expect(page.getByTestId("inquiry-success")).toContainText("문의가 접수되었습니다");
  await expect(page.getByTestId("inquiry-success")).toContainText("예약이 확정되지 않습니다");

  await login(page);
  await page.goto("/admin/consultas");
  const row = page.getByTestId("inquiry-row").filter({ hasText: name });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("Tucson");
  await expect(row).toContainText("신규");
  await row.getByLabel("상태").selectOption("contacted");
  await row.getByLabel("관리자 메모").fill("전화 완료");
  await row.getByRole("button", { name: "저장" }).click();
  await expect(row.getByRole("status")).toHaveText("저장됨");
  await page.reload();
  const after = page.getByTestId("inquiry-row").filter({ hasText: name });
  await expect(after).toContainText("고객 연락 완료");
  await expect(after.getByLabel("관리자 메모")).toHaveValue("전화 완료");
});

test("12. 모바일에서 비교표와 차량 페이지가 정상 표시된다", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("/vehiculos");
  await expect(page.getByTestId("comparison-table")).toBeHidden();
  const cards = page.getByTestId("comparison-cards");
  await expect(cards).toBeVisible();
  await expect(cards.getByRole("heading", { name: /Tucson 2026/ })).toBeVisible();
  await expect(cards).toContainText("USD 1,210");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.goto("/vehiculos/tivoli-2023");
  await expect(page.getByTestId("vehicle-main").getByTestId("price-total")).toBeVisible();
  const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow2).toBeLessThanOrEqual(0);
  await page.screenshot({ path: "test-results/mobile-vehicle.png", fullPage: true });
  await ctx.close();
});

test("13. 게시 중단한 차량은 공개 카탈로그에서 제외된다", async ({ page }) => {
  await login(page);
  await page.goto(testVehicleAdminUrl);
  await page.getByTestId("toggle-publish").click();
  await expect(page.getByTestId("toggle-publish")).toHaveText("지금 게시");

  await page.goto("/vehiculos");
  await expect(await cardFor(page, `${TEST_NAME} 2024`)).toHaveCount(0);
  await expect(page.getByTestId("vehicle-card")).toHaveCount(3);
  const res = await page.goto(`/vehiculos/${testVehicleSlug}`);
  expect(res?.status()).toBe(404);
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain(testVehicleSlug);
});

test("정리: 테스트 차량 삭제 후 초기 3종만 남는다", async ({ page }) => {
  await login(page);
  for (const url of [testVehicleAdminUrl, duplicateAdminUrl]) {
    await page.goto(url);
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "영구 삭제" }).click();
    await expect(page).toHaveURL(/\/admin\/vehiculos\?deleted=1/);
  }
  await page.goto("/vehiculos");
  await expect(page.getByTestId("vehicle-card")).toHaveCount(3);
});
