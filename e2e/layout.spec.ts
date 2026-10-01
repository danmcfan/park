import { parks } from "../src/data/parks";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("starts at Zion with no site title and breathing room above it", async ({ page }) => {
  await expect(page.locator("h1")).toHaveCount(0);
  await expect(page.locator("main section").first()).toHaveAttribute("id", "zion");
  const title = await page.locator("#zion .park-title").boundingBox();
  const nav = await page.locator(".park-nav").boundingBox();
  // On phones the title sits below the badge bar; either way, not at the edge.
  const below = nav && nav.width > nav.height ? nav.y + nav.height : 0;
  expect(title!.y - below).toBeGreaterThanOrEqual(48);
});

test("has a section per park in trip order", async ({ page }) => {
  await expect(page.locator("main section")).toHaveCount(4);
  const ids = await page.locator("main section").evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(["zion", "bryce", "grand-teton", "yellowstone"]);
});

test("never scrolls sideways", async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("every gallery row is flush to both edges with prints of equal height", async ({ page }) => {
  const galleries = await page.locator(".gallery").evaluateAll((gs) =>
    gs.map((g) => {
      const gw = (g as HTMLElement).offsetWidth;
      return [...g.querySelectorAll<HTMLElement>(".gallery-row")].map((row) => {
        const tiles = [...row.querySelectorAll<HTMLElement>(".tile")];
        const heights = tiles.map((t) => t.offsetHeight);
        const last = tiles[tiles.length - 1];
        return {
          left: tiles[0].offsetLeft - row.offsetLeft,
          rightGap: gw - (last.offsetLeft - row.offsetLeft + last.offsetWidth),
          heightSpread: Math.max(...heights) - Math.min(...heights),
        };
      });
    }),
  );
  for (const rows of galleries)
    for (const r of rows) {
      expect(Math.abs(r.left)).toBeLessThanOrEqual(1);
      expect(Math.abs(r.rightGap)).toBeLessThanOrEqual(1);
      expect(r.heightSpread).toBeLessThanOrEqual(1);
    }
});

test("prints are taped down with a small tilt", async ({ page }) => {
  const prints = await page.locator(".tile").evaluateAll((els) =>
    els.map((el) => ({
      tilt: parseFloat(getComputedStyle(el).rotate),
      tapes: [...el.querySelectorAll(".tape")].filter((t) => getComputedStyle(t).display !== "none").length,
    })),
  );
  expect(prints.length).toBe(parks.reduce((n, p) => n + p.photos.length, 0));
  for (const p of prints) {
    expect(Math.abs(p.tilt)).toBeGreaterThanOrEqual(0.4);
    expect(Math.abs(p.tilt)).toBeLessThanOrEqual(1.4);
    expect(p.tapes).toBeGreaterThanOrEqual(1);
  }
});

test("captions are not shown on the board", async ({ page }) => {
  await expect(page.locator(".gallery figcaption")).toHaveCount(0);
});
