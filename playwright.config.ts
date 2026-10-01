import { defineConfig, devices } from "@playwright/test";

// Browser tests against a production build (`bun run build` + `vite preview`).
// Every spec runs on desktop Chromium and on an iPhone in WebKit (Safari's
// engine). @playwright/test is pinned to match the browsers installed locally;
// after upgrading it, run `bunx playwright install chromium webkit`.
//
// Set BASE_URL to test a deployed site instead, e.g.
//   BASE_URL=https://park.dannyobrien.dev bun run test:e2e
const PORT = 4173;
const remote = process.env.BASE_URL;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: remote ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "iphone", use: { ...devices["iPhone 15 Pro"] } },
  ],
  webServer: remote
    ? undefined
    : {
        command: `bun run build && bun run preview --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
