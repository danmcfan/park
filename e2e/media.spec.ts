import { expect, test } from "./fixtures";

test("photos load at their true orientation", async ({ page }) => {
  await page.goto("/#yellowstone");
  const imgs = page.locator("#yellowstone .tile img");
  await imgs.first().scrollIntoViewIfNeeded();
  await expect
    .poll(() => imgs.evaluateAll((els) => els.every((i) => (i as HTMLImageElement).naturalWidth > 0)))
    .toBe(true);
  const sizes = await imgs.evaluateAll((els) =>
    els.map((i) => [(i as HTMLImageElement).naturalWidth, (i as HTMLImageElement).naturalHeight]),
  );
  expect(sizes).toContainEqual([1200, 1600]);
  expect(sizes).toContainEqual([1600, 1200]);
});

test("videos play only while on screen", async ({ page }) => {
  await page.goto("/");
  const videos = page.locator(".tile video");
  await expect(videos).toHaveCount(2);
  // Off screen at the top of the page.
  expect((await videos.evaluateAll((vs) => vs.map((v) => (v as HTMLVideoElement).paused)))).toEqual([true, true]);

  const first = videos.first();
  await first.scrollIntoViewIfNeeded();
  await expect.poll(() => first.evaluate((v) => !(v as HTMLVideoElement).paused)).toBe(true);
  const size = await first.evaluate((v) => [(v as HTMLVideoElement).videoWidth, (v as HTMLVideoElement).videoHeight]);
  expect(size).toEqual([1280, 720]);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => first.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true);
});

test.describe("with reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("videos wait for the viewer and show controls", async ({ page }) => {
    await page.goto("/#yellowstone");
    const first = page.locator(".tile video").first();
    await first.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(await first.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true);
    expect(await first.evaluate((v) => (v as HTMLVideoElement).controls)).toBe(true);
  });

  test("prints keep their tilt but don't animate", async ({ page }) => {
    await page.goto("/");
    const tile = page.locator(".tile").first();
    expect(await tile.evaluate((t) => getComputedStyle(t).transitionDuration)).toBe("0s");
  });
});
