import { SMALL_PX, aspectOf, parks, smallSrc } from "../src/data/parks";
import { expect, test } from "./fixtures";

const videoCount = parks.flatMap((p) => p.photos).filter((i) => i.src && i.type === "video").length;

test("photos load at their true orientation", async ({ page }) => {
  const park = parks.find((p) => p.photos.some((i) => i.src && i.type === "image"))!;
  const photos = park.photos.filter((i) => i.src && i.type === "image");
  await page.goto(`/#${park.slug}`);
  // Tiles keep data order, so the nth image is the nth photo.
  const imgs = page.locator(`#${park.slug} .tile img`);
  await expect(imgs).toHaveCount(photos.length);
  for (const [n, photo] of photos.entries()) {
    const img = imgs.nth(n);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i) => (i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const [w, h] = await img.evaluate((i) => [(i as HTMLImageElement).naturalWidth, (i as HTMLImageElement).naturalHeight]);
    expect(w / h, photo.src).toBeCloseTo(aspectOf(photo), 2);
  }
});

test("prints fetch the small photo when it's enough, the lightbox the full one", async ({ page }) => {
  const park = parks.find((p) => p.photos.some((i) => i.src && i.type === "image"))!;
  const photos = park.photos.filter((i) => i.src && i.type === "image");
  await page.goto(`/#${park.slug}`);
  const imgs = page.locator(`#${park.slug} .tile img`);
  let small = 0;
  for (const [n, photo] of photos.entries()) {
    const img = imgs.nth(n);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i) => (i as HTMLImageElement).currentSrc)).not.toBe("");
    const { current, sizes, width, dpr } = await img.evaluate((i) => {
      const el = i as HTMLImageElement;
      return { current: new URL(el.currentSrc).pathname, sizes: parseFloat(el.sizes), width: el.offsetWidth, dpr: devicePixelRatio };
    });
    // `sizes` is the print's share of its row, just over the photo inside the border.
    expect(sizes, photo.src).toBeGreaterThanOrEqual(width);
    expect(sizes, photo.src).toBeLessThanOrEqual(width + 40);
    const smallWidth = Math.round(SMALL_PX * Math.min(1, aspectOf(photo)));
    const enough = smallWidth >= sizes * dpr;
    expect(current, `${photo.src} at ${sizes}px × ${dpr}`).toBe(enough ? smallSrc(photo.src!) : photo.src);
    if (enough) small++;
  }
  expect(small, "some prints use the small file").toBeGreaterThan(0);

  await page.locator(`#${park.slug} .tile-open`).first().click();
  const full = page.locator(`#${park.slug} dialog img`);
  await expect.poll(() => full.evaluate((i) => new URL((i as HTMLImageElement).currentSrc).pathname)).toBe(photos[0].src);
});

test("videos play only while on screen", async ({ page }) => {
  test.skip(!videoCount, "the trip has no videos yet");
  await page.goto("/");
  const videos = page.locator(".tile video");
  await expect(videos).toHaveCount(videoCount);
  const first = videos.first();
  // Start from wherever the video isn't: the bottom if it's near the top.
  const away = await first.evaluate((v) =>
    v.getBoundingClientRect().top > 2 * innerHeight ? 0 : document.documentElement.scrollHeight,
  );
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), away);
  await expect.poll(() => first.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true);

  await first.scrollIntoViewIfNeeded();
  await expect.poll(() => first.evaluate((v) => !(v as HTMLVideoElement).paused)).toBe(true);
  const size = await first.evaluate((v) => [(v as HTMLVideoElement).videoWidth, (v as HTMLVideoElement).videoHeight]);
  expect(Math.min(...size)).toBe(720);

  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), away);
  await expect.poll(() => first.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true);
});

test.describe("with reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("videos wait for the viewer and show controls", async ({ page }) => {
    test.skip(!videoCount, "the trip has no videos yet");
    await page.goto("/");
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
