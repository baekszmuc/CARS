import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

const chromium = process.env.PW_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    // 사이트는 브라우저 언어로 표시 언어를 고른다. 테스트는 한국어 화면 기준.
    locale: "ko-KR",
    launchOptions: fs.existsSync(chromium) ? { executablePath: chromium } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], locale: "ko-KR" } }],
});
