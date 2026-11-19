# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bs-cars.spec.ts >> 8. 관리자 로그인 없이 차량 정보를 변경할 수 없다
- Location: tests/e2e/bs-cars.spec.ts:88:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

Expected: []
Received: {"code": "PGRST301", "details": null, "hint": null, "message": "Empty JWT is sent in Authorization header"}
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - main [ref=f1e2]:
    - generic [ref=f1e3]:
      - img "BS Select" [ref=f1e4]:
        - generic [ref=f1e5]: BS SELECT
      - heading "관리자 로그인" [level=1] [ref=f1e6]
      - generic [ref=f1e7]:
        - generic [ref=f1e8]:
          - generic [ref=f1e9]: 이메일
          - textbox "이메일" [ref=f1e10]
        - generic [ref=f1e11]:
          - generic [ref=f1e12]: 비밀번호
          - textbox "비밀번호" [ref=f1e13]
        - button "로그인" [ref=f1e14] [cursor=pointer]
  - alert [ref=f1e15]
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import path from "node:path";
  3   | import { ANON_KEY, SUPABASE_URL, login, money } from "./helpers";
  4   | 
  5   | test.describe.configure({ mode: "serial" });
  6   | 
  7   | const INITIAL = [
  8   |   { slug: "tivoli-2023", title: "Tivoli 2023", base: 800, iva: 80, total: 880, year: "2023", km: "25,000 km" },
  9   |   { slug: "kia-seltos", title: "Kia Seltos 2027", base: 900, iva: 90, total: 990, year: "2027", km: "0 km" },
  10  |   { slug: "tucson", title: "Tucson 2026", base: 1100, iva: 110, total: 1210, year: "2026", km: "0 km" },
  11  | ];
  12  | 
  13  | const TEST_NAME = `E2E Prueba ${Date.now().toString(36)}`;
  14  | let testVehicleAdminUrl = "";
  15  | let testVehicleSlug = "";
  16  | let duplicateAdminUrl = "";
  17  | 
  18  | async function cardFor(page: Page, title: string) {
  19  |   const esc = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  20  |   return page.getByTestId("vehicle-card").filter({ has: page.getByRole("heading", { name: new RegExp(`(^| )${esc}$`) }) });
  21  | }
  22  | 
  23  | test("1. BS Select 웹사이트가 정상적으로 열린다", async ({ page }) => {
  24  |   const res = await page.goto("/");
  25  |   expect(res?.status()).toBe(200);
  26  |   await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("BS Select 차량 렌탈");
  27  |   // 홈: 브랜드 랜딩 — 컬렉션에 차량 3종이 모두 보인다
  28  |   await expect(page.getByTestId("home-vehicle")).toHaveCount(3);
  29  |   for (const name of [/Tivoli 2023$/, /Kia Seltos 2027$/, /Tucson 2026$/]) {
  30  |     await expect(page.getByRole("heading", { name })).toBeVisible();
  31  |   }
  32  |   await expect(page.getByRole("heading", { name: "렌트료에 포함된 서비스" })).toBeVisible();
  33  |   for (const p of ["/vehiculos", "/servicios", "/incluye", "/contacto", "/privacidad"]) {
  34  |     expect((await page.goto(p))?.status(), p).toBe(200);
  35  |   }
  36  | });
  37  | 
  38  | test("15. 언어 전환: 스페인어·영어로 바뀌고 선택이 유지된다", async ({ page, context }) => {
  39  |   await page.goto("/vehiculos/tucson");
  40  |   await page.locator('[data-lang="es"]').click();
  41  |   await expect(page).toHaveURL(/\/vehiculos\/tucson$/);
  42  |   await expect(page.locator("html")).toHaveAttribute("lang", "es");
  43  |   await expect(page.getByRole("heading", { name: "Ficha técnica del vehículo" })).toBeVisible();
  44  |   await page.goto("/");
  45  |   await expect(page.getByRole("heading", { name: "Servicios incluidos en el alquiler" })).toBeVisible();
  46  |   await page.locator('[data-lang="en"]').click();
  47  |   await expect(page.getByRole("heading", { name: "Services included in the rent" })).toBeVisible();
  48  |   await page.locator('[data-lang="ko"]').click();
  49  |   await expect(page.getByRole("heading", { name: "렌트료에 포함된 서비스" })).toBeVisible();
  50  |   await context.clearCookies();
  51  | });
  52  | 
  53  | test("2·3. 초기 차량 3종이 정확한 가격으로 표시되고 IVA 합계가 일치한다", async ({ page }) => {
  54  |   await page.goto("/vehiculos");
  55  |   for (const v of INITIAL) {
  56  |     const card = await cardFor(page, v.title);
  57  |     await expect(card).toHaveCount(1);
  58  |     await expect(card.getByTestId("price-base")).toHaveText(`USD ${v.base.toLocaleString("en-US")} / 월`);
  59  |     await expect(card).toContainText(`OPTION 0${INITIAL.indexOf(v) + 1}`);
  60  |     await expect(card.getByTestId("price-iva")).toHaveText(`USD ${v.iva.toLocaleString("en-US")}`);
  61  |     await expect(card.getByTestId("price-total")).toHaveText(`USD ${v.total.toLocaleString("en-US")} / 월`);
  62  |     const base = money(await card.getByTestId("price-base").innerText());
  63  |     const iva = money(await card.getByTestId("price-iva").innerText());
  64  |     const total = money(await card.getByTestId("price-total").innerText());
  65  |     expect(base + iva).toBe(total);
  66  |   }
  67  |   // 비교표
  68  |   const table = page.getByTestId("comparison-table");
  69  |   await expect(table).toBeVisible();
  70  |   const text = await table.innerText();
  71  |   for (const v of INITIAL) {
  72  |     expect(text).toContain(v.title);
  73  |     expect(text).toContain(`USD ${v.total.toLocaleString("en-US")}`);
  74  |   }
  75  |   expect(text).toContain("25,000 km");
  76  |   expect(text).toContain("1.5 CRDi 터보 디젤");
  77  |   expect(text).toContain("자동 8단");
  78  |   // 상세 페이지 가격
  79  |   for (const v of INITIAL) {
  80  |     await page.goto(`/vehiculos/${v.slug}`);
  81  |     await expect(page.getByTestId("vehicle-title")).toHaveText(v.title);
  82  |     await expect(page.getByRole("heading", { name: "차량 사양" })).toBeVisible();
  83  |     await expect(page.getByRole("heading", { name: "다른 차량 옵션" })).toBeVisible();
  84  |     await expect(page.getByTestId("vehicle-main").getByTestId("price-total")).toContainText(`USD ${v.total.toLocaleString("en-US")}`);
  85  |   }
  86  | });
  87  | 
  88  | test("8. 관리자 로그인 없이 차량 정보를 변경할 수 없다", async ({ page, request }) => {
  89  |   await page.goto("/admin");
  90  |   await expect(page).toHaveURL(/\/admin\/login$/);
  91  |   await page.goto("/admin/vehiculos");
  92  |   await expect(page).toHaveURL(/\/admin\/login$/);
  93  | 
  94  |   const headers = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
  95  |   // anon 키로 가격 변경 시도 → RLS로 0행 변경
  96  |   const patch = await request.patch(`${SUPABASE_URL}/rest/v1/vehicles?slug=eq.tucson`, { headers, data: { base_price: 1 } });
> 97  |   expect(await patch.json()).toEqual([]);
      |                              ^ Error: expect(received).toEqual(expected) // deep equality
  98  |   const del = await request.delete(`${SUPABASE_URL}/rest/v1/vehicles?slug=eq.tucson`, { headers });
  99  |   expect(await del.json()).toEqual([]);
  100 |   // anon 키로 고객 문의 열람 시도 → 거부
  101 |   const inq = await request.get(`${SUPABASE_URL}/rest/v1/inquiries?select=*`, { headers });
  102 |   expect(inq.ok()).toBeFalsy();
  103 |   // 설정 변경 시도 → 0행
  104 |   const st = await request.patch(`${SUPABASE_URL}/rest/v1/settings?id=eq.1`, { headers, data: { business_name: "HACK" } });
  105 |   expect(await st.json()).toEqual([]);
  106 |   // anon 사진 업로드 시도 → 거부
  107 |   const up = await request.post(`${SUPABASE_URL}/storage/v1/object/vehicle-photos/hack/x.png`, {
  108 |     headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "image/png" },
  109 |     data: Buffer.from("x"),
  110 |   });
  111 |   expect(up.ok()).toBeFalsy();
  112 | 
  113 |   await page.goto("/vehiculos/tucson");
  114 |   await expect(page.getByTestId("vehicle-main").getByTestId("price-base")).toContainText("USD 1,100");
  115 | });
  116 | 
  117 | test("4. 차량 등록 시 고유 URL이 자동 생성되고 중복 시 식별자가 붙는다", async ({ page }) => {
  118 |   await login(page);
  119 |   await page.goto("/admin/vehiculos/nuevo");
  120 |   await page.getByLabel("차량명 *").fill(TEST_NAME);
  121 |   await page.getByLabel("연식").fill("2024");
  122 |   await page.getByLabel("주행거리 (km)").fill("1200");
  123 |   await page.getByLabel(/기본 렌트료/).fill("700");
  124 |   await page.getByLabel("고객용 사이트에 게시").check();
  125 |   await page.getByRole("button", { name: "차량 등록" }).click();
  126 |   await expect(page.getByText("차량이 등록되었습니다")).toBeVisible();
  127 |   testVehicleAdminUrl = page.url().replace(/\?.*$/, "");
  128 |   const url = await page.getByTestId("admin-vehicle-url").innerText();
  129 |   const expectedSlug = TEST_NAME.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-2024";
  130 |   expect(url).toBe(`http://localhost:3000/vehiculos/${expectedSlug}`);
  131 |   testVehicleSlug = expectedSlug;
  132 | 
  133 |   // 같은 이름+연식으로 다시 등록 → 고유 식별자 추가
  134 |   await page.goto("/admin/vehiculos/nuevo");
  135 |   await page.getByLabel("차량명 *").fill(TEST_NAME);
  136 |   await page.getByLabel("연식").fill("2024");
  137 |   await page.getByLabel(/기본 렌트료/).fill("700");
  138 |   await page.getByRole("button", { name: "차량 등록" }).click();
  139 |   await expect(page.getByText("차량이 등록되었습니다")).toBeVisible();
  140 |   duplicateAdminUrl = page.url().replace(/\?.*$/, "");
  141 |   const dupUrl = await page.getByTestId("admin-vehicle-url").innerText();
  142 |   expect(dupUrl).toMatch(new RegExp(`/vehiculos/${expectedSlug}-[0-9a-f]{6}$`));
  143 | });
  144 | 
  145 | test("5·14. 차량 링크가 상세 페이지를 열고, 직접 입력·새로고침해도 정상 작동한다", async ({ page }) => {
  146 |   const res = await page.goto(`/vehiculos/${testVehicleSlug}`);
  147 |   expect(res?.status()).toBe(200);
  148 |   await expect(page.getByTestId("vehicle-title")).toHaveText(`${TEST_NAME} 2024`);
  149 |   await expect(page.getByTestId("vehicle-main").getByTestId("price-total")).toContainText("USD 770");
  150 |   await page.reload();
  151 |   await expect(page.getByTestId("vehicle-title")).toHaveText(`${TEST_NAME} 2024`);
  152 |   await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", new RegExp(TEST_NAME));
  153 |   // 카탈로그에도 노출
  154 |   await page.goto("/vehiculos");
  155 |   await expect(await cardFor(page, `${TEST_NAME} 2024`)).toHaveCount(1);
  156 | });
  157 | 
  158 | test("6. 링크 복사 버튼이 정상 작동한다", async ({ page, context }) => {
  159 |   await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  160 |   await page.goto("/vehiculos/kia-seltos");
  161 |   await page.getByRole("button", { name: "링크 복사" }).first().click();
  162 |   await expect(page.getByRole("button", { name: "복사되었습니다" }).first()).toBeVisible();
  163 |   const clip = await page.evaluate(() => navigator.clipboard.readText());
  164 |   expect(clip).toBe("http://localhost:3000/vehiculos/kia-seltos");
  165 | });
  166 | 
  167 | test("7. WhatsApp 메시지에 올바른 차량 정보와 링크가 들어간다", async ({ page }) => {
  168 |   const expected = (url: string) =>
  169 |     [
  170 |       "안녕하세요. BS Select 차량 렌탈에 대해 문의드립니다.",
  171 |       "관심 차량: Kia Seltos 2027",
  172 |       "월 렌트료: USD 900 + IVA",
  173 |       "IVA 포함 가격: USD 990",
  174 |       "차량의 이용 가능 여부와 렌탈 조건을 안내해 주실 수 있을까요?",
  175 |       `차량 상세 링크: ${url}`,
  176 |     ].join("\n");
  177 |   // 등록된 번호를 기억해 두고 잠시 비운다
  178 |   await login(page);
  179 |   await page.goto("/admin/configuracion");
  180 |   const originalNumber = await page.getByLabel("WhatsApp 번호").inputValue();
  181 |   await page.getByLabel("WhatsApp 번호").fill("");
  182 |   await page.getByRole("button", { name: "설정 저장" }).click();
  183 |   await expect(page.getByTestId("form-message")).toHaveText("설정이 저장되었습니다.");
  184 | 
  185 |   // 번호 미등록: "이 옵션 문의하기"가 받는 사람을 고르는 WhatsApp 메시지로 열린다
  186 |   await page.goto("/vehiculos/kia-seltos");
  187 |   const btn0 = page.getByTestId("vehicle-main").getByTestId("option-inquiry");
  188 |   await expect(btn0).toHaveText(/이 옵션 문의하기/);
  189 |   const href0 = await btn0.getAttribute("href");
  190 |   expect(href0).toMatch(/^https:\/\/wa\.me\/\?text=/);
  191 |   expect(decodeURIComponent(href0!.split("?text=")[1])).toBe(expected("http://localhost:3000/vehiculos/kia-seltos"));
  192 |   // 카탈로그 카드의 버튼도 차량별 메시지
  193 |   await page.goto("/vehiculos");
  194 |   const cardHref = await (await cardFor(page, "Tucson 2026")).getByTestId("option-inquiry").getAttribute("href");
  195 |   expect(decodeURIComponent(cardHref!)).toContain("관심 차량: Tucson 2026");
  196 | 
  197 |   await page.goto("/admin/configuracion");
```