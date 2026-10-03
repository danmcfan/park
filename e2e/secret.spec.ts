import type { Page } from "@playwright/test";
import { parks } from "../src/data/parks";
import { secret } from "../src/data/secret";
import { expect, test } from "./fixtures";

const park = parks.find((p) => p.slug === secret.park)!;
const map = `#${park.slug} .state-map`;

// Drags the pin so its hole lands on the given client point.
const dragPinTo = async (page: Page, to: { x: number; y: number }) => {
  const head = (await page.locator(`${map} .pin-head`).boundingBox())!;
  const hole = (await page.locator(`${map} .state-pin`).boundingBox())!;
  const from = { x: head.x + head.width / 2, y: head.y + head.height / 2 };
  const dx = to.x - (hole.x + hole.width / 2);
  const dy = to.y - (hole.y + hole.height / 2);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + dx, from.y + dy, { steps: 8 });
  await page.mouse.up();
};

// Center of the secret letter in the state's name, in client coordinates.
const letterCenter = (page: Page) =>
  page.locator(`${map} .state-name`).evaluate((el, i) => {
    const text = el as SVGTextElement;
    const box = text.getExtentOfChar(i);
    return new DOMPoint(box.x + box.width / 2, box.y + box.height / 2).matrixTransform(text.getScreenCTM()!);
  }, park.state.toUpperCase().indexOf(secret.letter));

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/#${park.slug}`);
  await page.locator(map).scrollIntoViewIfNeeded();
});

test("a pin dropped anywhere else springs back and reveals nothing", async ({ page }) => {
  const home = (await page.locator(`${map} .state-pin`).boundingBox())!;
  const letter = await letterCenter(page);
  await dragPinTo(page, { x: letter.x, y: letter.y + 60 });
  await expect(page.locator(".tile.secret")).toHaveCount(0);
  await expect.poll(async () => (await page.locator(`${map} .state-pin`).boundingBox())!.x).toBeCloseTo(home.x, 0);
});

test(`pushing the pin into the ${secret.letter} reveals the secret print, red-bordered`, async ({ page }) => {
  const before = park.photos[secret.replaces];
  await dragPinTo(page, await letterCenter(page));
  const tile = page.locator(`#${park.slug} .tile.secret`);
  await expect(tile).toHaveCount(1);
  await expect(page.locator(".tile.secret")).toHaveCount(1);
  expect(await tile.evaluate((el) => getComputedStyle(el).backgroundColor)).toMatch(/^rgb\((1[6-9]\d|2\d\d), \d{2}, \d{2}\)$/);
  await expect(page.locator(`#${park.slug} .tile`)).toHaveCount(park.photos.length);
  if (before.src) await expect(page.locator(`#${park.slug} [src="${before.src}"], #${park.slug} [poster="${before.poster}"]`)).toHaveCount(0);
});
