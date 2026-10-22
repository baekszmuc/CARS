#!/usr/bin/env node
/**
 * 실행 중인 사이트를 정적 HTML 미리보기로 내보낸다 (디자인 공유용).
 *
 *   node scripts/preview-snapshot.mjs [출력폴더] [사이트주소]
 *
 * - CSS는 각 페이지에 인라인, 폰트는 Google Fonts 링크로 대체
 * - 스크립트 제거 (링크 복사·문의 양식은 미리보기용 최소 스크립트로 대체)
 * - 내부 링크를 미리보기 파일명으로 변환
 * - PREVIEW_MODE=customer (기본): 고객용 페이지만. 문의 양식은 입력 내용을 WhatsApp 메시지로 만들어 준다.
 * - PREVIEW_MODE=admin: 관리자 화면만 (로그인 후 읽기 전용 스냅샷, E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD).
 *   고객 페이지로 가는 링크는 PREVIEW_PUBLIC_URL 의 공개 주소로 연결한다.
 * - PREVIEW_PUBLIC_URL 이 있으면 차량 링크(문의 메시지·링크 복사)를 그 주소의 미리보기 페이지로 바꾼다
 *   예: PREVIEW_PUBLIC_URL=https://baekszmuc.github.io/CARS
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";

const out = path.resolve(process.argv[2] ?? "preview-out");
const base = (process.argv[3] ?? "http://localhost:3000").replace(/\/$/, "");
const publicUrl = (process.env.PREVIEW_PUBLIC_URL ?? "").replace(/\/$/, "");
const mode = process.env.PREVIEW_MODE === "admin" ? "admin" : "customer";

/** 사이트 기준 주소로 만들어진 차량 링크를 공개 미리보기 주소로 바꾼다 (평문·URL 인코딩 모두) */
function toPublicLinks(html) {
  if (!publicUrl) return html;
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const raw = new RegExp(esc(`${base}/vehiculos/`) + "([a-z0-9-]+)", "g");
  const enc = new RegExp(esc(encodeURIComponent(`${base}/vehiculos/`)) + "([a-z0-9-]+)", "g");
  return html
    .replace(raw, (_, slug) => `${publicUrl}/vehiculo-${slug}.html`)
    .replace(enc, (_, slug) => encodeURIComponent(`${publicUrl}/vehiculo-${slug}.html`));
}
const email = process.env.E2E_ADMIN_EMAIL ?? "admin@bscars.local";
const password = process.env.E2E_ADMIN_PASSWORD ?? "TestPassword123!";
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;

const FONTS =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap";

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

// 공개 차량 slug 목록
await page.goto(`${base}/vehiculos`);
const slugs = await page.$$eval('[data-testid="vehicle-card"] a[href^="/vehiculos/"]', (as) => [
  ...new Set(as.map((a) => a.getAttribute("href").split("/")[2])),
]);

const pages = [
  { url: "/", file: "index.html" },
  { url: "/vehiculos", file: "vehiculos.html" },
  ...slugs.map((s) => ({ url: `/vehiculos/${s}`, file: `vehiculo-${s}.html` })),
  { url: "/servicios", file: "servicios.html" },
  { url: "/incluye", file: "incluye.html" },
  { url: "/contacto", file: "contacto.html" },
  { url: "/privacidad", file: "privacidad.html" },
];

/** 고객 페이지 경로 → 미리보기 파일명 (없으면 null) */
function publicFile(pathOnly) {
  if (pathOnly === "/") return "index.html";
  if (pathOnly === "/vehiculos") return "vehiculos.html";
  const m = pathOnly.match(/^\/vehiculos\/([^/]+)$/);
  if (m) return `vehiculo-${m[1]}.html`;
  const simple = { "/servicios": "servicios.html", "/incluye": "incluye.html", "/contacto": "contacto.html", "/privacidad": "privacidad.html" };
  return simple[pathOnly] ?? null;
}

function mapHref(href, adminMap) {
  if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const [p, hash] = href.split("#");
  const pathOnly = p.split("?")[0];
  const h = hash ? `#${hash}` : "";
  if (pathOnly === "") return h || "#";
  if (adminMap[pathOnly]) return adminMap[pathOnly] + h;
  if (pathOnly.startsWith("/admin")) return "#";
  const file = publicFile(pathOnly);
  if (!file) return "#";
  // 관리자 미리보기에서 고객 페이지는 공개 주소로 연다
  if (mode === "admin") return publicUrl ? `${publicUrl}/${file}${h}` : "#";
  return file + h;
}

const cssCache = new Map();
async function inlineCss(hrefs) {
  let css = "";
  for (const h of hrefs) {
    if (!cssCache.has(h)) {
      const text = await (await fetch(base + h)).text();
      cssCache.set(h, text.replace(/@font-face\{[^}]*\}/g, ""));
    }
    css += cssCache.get(h);
  }
  return css;
}

const PREVIEW_SCRIPT = `
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-copy-url]");
  if (!b) return;
  var url = b.getAttribute("data-copy-url"), span = b.querySelector("span") || b, old = span.textContent;
  var done = function (t) { span.textContent = t; setTimeout(function () { span.textContent = old; }, 1800); };
  try { navigator.clipboard.writeText(url).then(function () { done("복사되었습니다"); }, function () { done(url); }); } catch (err) { done(url); }
});
document.addEventListener("click", function (e) {
  var t = e.target.closest('ul[aria-label="사진 선택"] button');
  if (!t) return;
  var list = t.closest("ul"), main = list.previousElementSibling.querySelector("img"), thumb = t.querySelector("img");
  if (main && thumb) main.src = thumb.src;
  list.querySelectorAll("button").forEach(function (b) {
    var on = b === t;
    b.setAttribute("aria-pressed", on);
    b.classList.toggle("ring-2", on); b.classList.toggle("ring-obsidian", on); b.classList.toggle("opacity-75", !on);
  });
});
`;

/** 고객용: 문의 양식 → 입력 내용이 담긴 WhatsApp 메시지 (BS CARS 번호로) */
const CUSTOMER_FORM_SCRIPT = `
document.addEventListener("submit", function (e) {
  e.preventDefault();
  var f = e.target;
  var val = function (n) { var el = f.elements[n]; return el ? String(el.value || "").trim() : ""; };
  var note = f.querySelector(".preview-note");
  if (!note) { note = document.createElement("div"); note.className = "preview-note"; f.appendChild(note); }
  if (!val("name") || !val("phone")) { note.textContent = "이름과 전화번호를 입력해 주세요."; return; }
  var sel = f.elements["vehicle_id"], car = sel && sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : "아직 정하지 않음";
  var lines = ["안녕하세요. BS CARS 차량 렌탈 문의드립니다.", "이름: " + val("name"), "전화번호: " + val("phone")];
  if (val("email")) lines.push("이메일: " + val("email"));
  lines.push("관심 차량: " + car);
  if (val("pickup_date") || val("return_date")) lines.push("희망 렌트 기간: " + (val("pickup_date") || "미정") + " ~ " + (val("return_date") || "미정"));
  if (val("message")) lines.push("문의사항: " + val("message"));
  var wa = document.querySelector('a[href^="https://wa.me/"][href*="wa.me/5"]');
  var num = wa ? (wa.getAttribute("href").match(/wa\\.me\\/(\\d+)/) || [])[1] : "";
  var href = "https://wa.me/" + (num || "") + "?text=" + encodeURIComponent(lines.join("\\n"));
  note.innerHTML = "";
  var p = document.createElement("p"); p.textContent = "아래 버튼을 누르면 입력하신 내용으로 WhatsApp 메시지가 열립니다. 문의만으로 예약이 확정되지는 않습니다.";
  var a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer"; a.className = "btn btn-primary"; a.textContent = "WhatsApp으로 문의 보내기";
  note.appendChild(p); note.appendChild(a); a.focus();
});`;

async function capture(file, isMain, adminMap, banner) {
  const html = await page.evaluate(
    ({ adminMapIn }) => {
      const doc = document.documentElement.cloneNode(true);
      doc.querySelectorAll("script, link[rel=preload], link[rel=modulepreload], link[rel=icon], noscript, next-route-announcer, nextjs-portal").forEach((n) => n.remove());
      const css = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => {
        const h = l.getAttribute("href");
        l.remove();
        return h;
      });
      doc.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src");
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        if (src && !src.startsWith("data:")) img.setAttribute("src", "@@IMG" + encodeURIComponent(src) + "@@");
      });
      doc.querySelectorAll("[href]").forEach((a) => a.setAttribute("href", "@@" + encodeURIComponent(a.getAttribute("href")) + "@@"));
      return { css, head: doc.querySelector("head").innerHTML, body: doc.querySelector("body").innerHTML, htmlClass: doc.className, adminMapIn };
    },
    { adminMapIn: adminMap },
  );
  const css = await inlineCss(html.css);
  // 이미지: 1200px webp 로 내려받아 img/ 에 저장
  const imgs = [...new Set([...(html.head + html.body).matchAll(/@@IMG([^"@]*)@@/g)].map((m) => decodeURIComponent(m[1])))];
  const imgMap = {};
  for (const src of imgs) {
    const u = new URL(src.replace(/&amp;/g, "&"), base);
    if (u.pathname === "/_next/image") u.searchParams.set("w", "1200");
    const res = await fetch(u, { headers: { Accept: "image/webp,image/*" } });
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = (res.headers.get("content-type") ?? "").includes("webp") ? "webp" : (res.headers.get("content-type") ?? "").includes("png") ? "png" : "jpg";
    const name = `img/${createHash("sha1").update(u.toString()).digest("hex").slice(0, 12)}.${ext}`;
    fs.mkdirSync(path.join(out, "img"), { recursive: true });
    fs.writeFileSync(path.join(out, name), buf);
    imgMap[src] = name;
  }
  const fix = (s) =>
    toPublicLinks(s).replace(/src="@@IMG([^"@]*)@@"/g, (_, e) => `src="${imgMap[decodeURIComponent(e)]}"`).replace(/href="@@([^"@]*)@@"/g, (_, e) => `href="${mapHref(toPublicLinks(decodeURIComponent(e)), adminMap)}"`);
  const bannerHtml = banner ? `<div class="preview-banner">${banner}</div>` : "";
  const style = `<link rel="stylesheet" href="${FONTS}"><style>${css}
.preview-banner{background:#26282c;color:#e9eaed;font-size:12px;line-height:1.5;padding:8px max(16px,env(safe-area-inset-left,0px));text-align:center}
.preview-banner a{color:#fff;text-decoration:underline;margin-left:8px}
.preview-note{display:grid;gap:10px;margin-top:4px;font-size:14px;color:#26282c}
.preview-note:empty{display:none}
</style>`;
  const head = fix(html.head).replace(/<meta name="viewport"[^>]*>/, "").replace(/<meta charset="[^"]*">/, "");
  const body = bannerHtml + fix(html.body) + `<script>${PREVIEW_SCRIPT}${mode === "customer" ? CUSTOMER_FORM_SCRIPT : ""}</script>`;
  const doc = isMain
    ? `${head.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? "<title>BS CARS</title>"}\n${head.replace(/<title>[\s\S]*?<\/title>/, "")}\n${style}\n<div class="${html.htmlClass}">${body}</div>`
    : `<!doctype html><html lang="ko" class="${html.htmlClass}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${head}${style}</head><body>${body}</body></html>`;
  fs.writeFileSync(path.join(out, file), doc);
}

fs.mkdirSync(out, { recursive: true });

if (mode === "admin") {
  // 관리자 화면만 (대시보드가 index.html)
  await page.goto(`${base}/admin/login`);
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL(`${base}/admin`);
  await page.goto(`${base}/admin/vehiculos`);
  const firstEdit = await page.locator('a:has-text("수정")').first().getAttribute("href");
  const adminPages = [
    { url: "/admin", file: "index.html" },
    { url: "/admin/vehiculos", file: "admin-vehiculos.html" },
    { url: firstEdit, file: "admin-vehiculo.html" },
    { url: "/admin/consultas", file: "admin-consultas.html" },
    { url: "/admin/configuracion", file: "admin-configuracion.html" },
  ];
  const adminMap = Object.fromEntries(adminPages.map((p) => [p.url, p.file]));
  const site = publicUrl ? `<a href="${publicUrl}/" target="_blank" rel="noopener">고객용 사이트 열기 ↗</a>` : "";
  const banner = `관리자 화면 미리보기 (읽기 전용) — 버튼과 저장은 동작하지 않습니다. 실제 관리는 사이트 배포 후 /admin 에서 로그인해 사용합니다.${site}`;
  for (const p of adminPages) {
    await page.goto(base + p.url);
    await page.waitForLoadState("networkidle");
    await capture(p.file, p.file === "index.html", adminMap, banner);
  }
} else {
  // 고객용 페이지만 (관리자 화면·미리보기 안내 없음)
  for (const p of pages) {
    await page.goto(base + p.url);
    await page.waitForLoadState("networkidle");
    await capture(p.file, p.file === "index.html", {}, "");
  }
}
await browser.close();
console.log(`${mode} preview written to ${out}:`, fs.readdirSync(out).join(", "));
