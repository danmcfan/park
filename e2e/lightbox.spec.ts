import type { Page } from "@playwright/test";
import { aspectOf, parks } from "../src/data/parks";
import { expect, isPhone, test } from "./fixtures";

// Expectations come from the data, so they hold whatever media is exported.
const viewable = (slug: string) => parks.find((p) => p.slug === slug)!.photos.filter((i) => i.src);
const park = parks.find((p) => viewable(p.slug).length >= 2)!;
const items = viewable(park.slug);
const dialog = `#${park.slug} dialog`;
const opener = `#${park.slug} .tile-open`;
const count = `${dialog} .lightbox-count`;

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator(opener).first().scrollIntoViewIfNeeded();
});

test("only tiles with real media open the lightbox", async ({ page }) => {
  await expect(page.locator(".tile-open")).toHaveCount(parks.flatMap((p) => viewable(p.slug)).length);
});

test("opens a print full screen with its caption, at its true shape", async ({ page }) => {
  await page.locator(opener).first().click();
  const box = page.locator(dialog);
  await expect(box).toBeVisible();
  if (items[0].caption) await expect(box.locator("figcaption")).toContainText(items[0].caption);
  await expect(box.locator(".lightbox-count")).toHaveText(`1 / ${items.length}`);
  const media = (await box.locator(".lightbox-media").boundingBox())!;
  const vp = page.viewportSize()!;
  expect(media.x).toBeGreaterThanOrEqual(0);
  expect(media.y).toBeGreaterThanOrEqual(0);
  expect(media.x + media.width).toBeLessThanOrEqual(vp.width);
  expect(media.y + media.height).toBeLessThanOrEqual(vp.height);
  expect(media.width / media.height).toBeCloseTo(aspectOf(items[0]), 1);
  // The page behind can't scroll.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
});

test("arrow keys move through the park and wrap around", async ({ page }) => {
  await page.locator(opener).first().click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(count)).toHaveText(`2 / ${items.length}`);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(count)).toHaveText(`${items.length} / ${items.length}`);
});

test("the next and previous buttons work", async ({ page }) => {
  await page.locator(opener).first().click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(count)).toHaveText(`2 / ${items.length}`);
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.locator(count)).toHaveText(`1 / ${items.length}`);
});

test("swiping moves between items on touch screens", async ({ page }) => {
  test.skip(!isPhone(page), "touch only");
  await page.locator(opener).first().click();
  await page.locator(`${dialog} figure`).evaluate((fig) => {
    const at = (x: number) => ({ bubbles: true, clientX: x, clientY: 300, pointerType: "touch", isPrimary: true });
    fig.dispatchEvent(new PointerEvent("pointerdown", at(300)));
    fig.dispatchEvent(new PointerEvent("pointerup", at(120)));
  });
  await expect(page.locator(count)).toHaveText(`2 / ${items.length}`);
});

test("a video plays in the lightbox", async ({ page }) => {
  const withVideo = parks.find((p) => viewable(p.slug).some((i) => i.type === "video"));
  test.skip(!withVideo, "the trip has no videos yet");
  const n = viewable(withVideo!.slug).findIndex((i) => i.type === "video");
  await page.locator(`#${withVideo!.slug} .tile-open`).nth(n).click();
  const video = page.locator(`#${withVideo!.slug} dialog video`);
  await expect(video).toHaveCount(1);
  await expect.poll(() => video.evaluate((v) => !(v as HTMLVideoElement).paused)).toBe(true);
});

const closers: [how: string, close: (page: Page) => Promise<void>][] = [
  ["Escape", (page) => page.keyboard.press("Escape")],
  ["the close button", (page) => page.getByRole("button", { name: "Close" }).click()],
  ["a backdrop click", (page) => page.mouse.click(4, page.viewportSize()!.height / 2)],
];
for (const [how, close] of closers) {
  test(`closes with ${how} and returns focus to the print`, async ({ page }) => {
    await page.locator(opener).first().click();
    await expect(page.locator(dialog)).toBeVisible();
    await close(page);
    await expect(page.locator(dialog)).toBeHidden();
    await expect(page.locator(opener).first()).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("visible");
  });
}
