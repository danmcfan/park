import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const theme = (page: Page) => page.evaluate(() => document.documentElement.dataset.theme);
const bg = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test("follows the system setting when nothing is saved", async ({ browser }) => {
  for (const [colorScheme, expected] of [
    ["light", "day"],
    ["dark", "night"],
  ] as const) {
    const ctx = await browser.newContext({ colorScheme });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await theme(page)).toBe(expected);
    await ctx.close();
  }
});

test("the toggle sits in the top right corner", async ({ page }) => {
  await page.goto("/");
  const box = (await page.locator(".theme-toggle").boundingBox())!;
  const vp = page.viewportSize()!;
  expect(box.x + box.width).toBeGreaterThan(vp.width - 80);
  expect(box.y).toBeLessThan(40);
  expect(box.width).toBeGreaterThanOrEqual(44);
});

test("the toggle stands out from the badge sash in both themes", async ({ page }) => {
  await page.goto("/");
  const rgb = (selector: string) =>
    page.locator(selector).evaluate((el) => getComputedStyle(el).backgroundColor.match(/\d+/g)!.slice(0, 3).map(Number));
  for (const t of ["day", "night"]) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), t);
    const [a, b] = [await rgb(".theme-toggle"), await rgb(".park-nav")];
    const distance = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    expect(distance, t).toBeGreaterThan(80);
  }
});

test("switches between day and night and remembers the choice", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const toggle = page.locator(".theme-toggle");
  expect(await theme(page)).toBe("day");
  await expect(toggle).toHaveAccessibleName("Switch to night mode");
  const dayBg = await bg(page);

  await toggle.click();
  expect(await theme(page)).toBe("night");
  await expect(toggle).toHaveAccessibleName("Switch to day mode");
  expect(await bg(page)).not.toBe(dayBg);

  await page.reload();
  expect(await theme(page)).toBe("night");

  await page.locator(".theme-toggle").click();
  await page.reload();
  expect(await theme(page)).toBe("day");
});

test("a saved choice wins over the system setting", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.setItem("theme", "day"));
  await page.goto("/");
  expect(await theme(page)).toBe("day");
});

test("the theme is set before the app loads, so night never flashes day", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  // Record the theme at the moment the app's module script starts.
  await page.addInitScript(() => {
    document.addEventListener(
      "readystatechange",
      () => ((window as unknown as { atInteractive: string }).atInteractive = document.documentElement.dataset.theme ?? ""),
      { once: true },
    );
  });
  await page.goto("/");
  expect(await page.evaluate(() => (window as unknown as { atInteractive: string }).atInteractive)).toBe("night");
});
