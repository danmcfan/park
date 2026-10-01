import { expect, isPhone, test } from "./fixtures";

const dialog = "#yellowstone dialog";
const opener = "#yellowstone .tile-open";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator(opener).first().scrollIntoViewIfNeeded();
});

test("only tiles with real media open the lightbox", async ({ page }) => {
  await expect(page.locator(".tile-open")).toHaveCount(4);
});

test("opens a photo full screen with its caption", async ({ page }) => {
  await page.locator(opener).first().click();
  const box = page.locator(dialog);
  await expect(box).toBeVisible();
  await expect(box.locator("figcaption")).toContainText("Liberty Cap");
  await expect(box.locator(".lightbox-count")).toHaveText("1 / 4");
  const media = (await box.locator(".lightbox-media").boundingBox())!;
  const vp = page.viewportSize()!;
  expect(media.x).toBeGreaterThanOrEqual(0);
  expect(media.y).toBeGreaterThanOrEqual(0);
  expect(media.x + media.width).toBeLessThanOrEqual(vp.width);
  expect(media.y + media.height).toBeLessThanOrEqual(vp.height);
  expect(media.width / media.height).toBeCloseTo(3 / 4, 1);
  // The page behind can't scroll.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
});

test("arrow keys move through the park and wrap around", async ({ page }) => {
  await page.locator(opener).first().click();
  const count = page.locator(`${dialog} .lightbox-count`);
  await page.keyboard.press("ArrowRight");
  await expect(count).toHaveText("2 / 4");
  await expect(page.locator(`${dialog} video`)).toHaveCount(1);
  await expect.poll(() => page.locator(`${dialog} video`).evaluate((v) => !(v as HTMLVideoElement).paused)).toBe(true);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(count).toHaveText("4 / 4");
});

test("the next and previous buttons work", async ({ page }) => {
  await page.locator(opener).first().click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(`${dialog} .lightbox-count`)).toHaveText("2 / 4");
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.locator(`${dialog} .lightbox-count`)).toHaveText("1 / 4");
});

test("swiping moves between items on touch screens", async ({ page }) => {
  test.skip(!isPhone(page), "touch only");
  await page.locator(opener).first().click();
  await page.locator(`${dialog} figure`).evaluate((fig) => {
    const at = (x: number) => ({ bubbles: true, clientX: x, clientY: 300, pointerType: "touch", isPrimary: true });
    fig.dispatchEvent(new PointerEvent("pointerdown", at(300)));
    fig.dispatchEvent(new PointerEvent("pointerup", at(120)));
  });
  await expect(page.locator(`${dialog} .lightbox-count`)).toHaveText("2 / 4");
});

for (const [how, close] of [
  ["Escape", async (page: import("@playwright/test").Page) => page.keyboard.press("Escape")],
  ["the close button", async (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Close" }).click()],
  ["a backdrop click", async (page: import("@playwright/test").Page) => page.mouse.click(4, page.viewportSize()!.height / 2)],
] as const) {
  test(`closes with ${how} and returns focus to the print`, async ({ page }) => {
    await page.locator(opener).first().click();
    await expect(page.locator(dialog)).toBeVisible();
    await close(page);
    await expect(page.locator(dialog)).toBeHidden();
    await expect(page.locator(opener).first()).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("visible");
  });
}
