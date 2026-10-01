import { expect, isPhone, test } from "./fixtures";

const slugs = ["zion", "bryce", "grand-teton", "yellowstone"];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("shows a loaded badge for each park", async ({ page }) => {
  const badges = page.locator(".park-nav-badge img");
  await expect(badges).toHaveCount(4);
  const loaded = await badges.evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).naturalWidth > 0));
  expect(loaded).toEqual([true, true, true, true]);
});

test("is a left rail on desktop and a top bar on phones", async ({ page }) => {
  const nav = (await page.locator(".park-nav").boundingBox())!;
  const viewport = page.viewportSize()!;
  if (isPhone(page)) {
    expect(nav.y).toBe(0);
    expect(nav.width).toBeGreaterThan(viewport.width * 0.9);
    expect(nav.height).toBeLessThan(100);
  } else {
    expect(nav.x).toBeLessThan(40);
    expect(nav.height).toBe(viewport.height);
    expect(nav.width).toBeLessThan(200);
  }
});

for (const slug of slugs) {
  test(`badge jumps to ${slug}`, async ({ page }) => {
    await page.locator(`.park-nav-badge[href="#${slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${slug}$`));
    // Wait for smooth scrolling to settle, then the title should be just below
    // the nav (phones) or the top of the window (desktop), and fully visible.
    await expect
      .poll(async () => {
        const title = (await page.locator(`#${slug} .park-title`).boundingBox())!;
        const nav = (await page.locator(".park-nav").boundingBox())!;
        const floor = isPhone(page) ? nav.y + nav.height : 0;
        return title.y >= floor && title.y - floor < 120;
      })
      .toBe(true);
  });
}

test("badges tilt and grow on hover", async ({ page }) => {
  test.skip(isPhone(page), "no hover on touch screens");
  const img = page.locator(".park-nav-badge img").nth(1);
  await page.locator(".park-nav-badge").nth(1).hover();
  await expect.poll(() => img.evaluate((i) => getComputedStyle(i).transform)).not.toBe("none");
  const [a, b] = await img.evaluate((i) => {
    const m = new DOMMatrix(getComputedStyle(i).transform);
    return [Math.hypot(m.a, m.b), (Math.atan2(m.b, m.a) * 180) / Math.PI];
  });
  expect(a).toBeGreaterThan(1.05);
  expect(Math.abs(b)).toBeGreaterThan(3);
});

test("tapping a badge on a phone doesn't leave it enlarged", async ({ page }) => {
  test.skip(!isPhone(page), "phones only");
  await page.locator(".park-nav-badge").nth(2).tap();
  const transform = await page.locator(".park-nav-badge img").nth(2).evaluate((i) => getComputedStyle(i).transform);
  expect(transform).toBe("none");
});

test("the page doesn't bounce past its top or bottom", async ({ page }) => {
  for (const el of ["html", "body"]) {
    expect(await page.locator(el).evaluate((e) => getComputedStyle(e).overscrollBehaviorY), el).toBe("none");
  }
});

test("the day/night patch stays on the sash as the page scrolls", async ({ page }) => {
  test.skip(!isPhone(page), "the sash is a side rail on desktop");
  // Both fixed: a sticky sash moves with iOS overscroll while the fixed patch doesn't.
  for (const sel of [".park-nav", ".theme-toggle"]) {
    expect(await page.locator(sel).evaluate((e) => getComputedStyle(e).position), sel).toBe("fixed");
  }
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const y of [0, 300, max / 2, max]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
    const nav = (await page.locator(".park-nav").boundingBox())!;
    const toggle = (await page.locator(".theme-toggle").boundingBox())!;
    expect(nav.y, `nav at ${y}`).toBe(0);
    expect(toggle.y, `patch at ${y}`).toBeGreaterThanOrEqual(nav.y);
    expect(toggle.y + toggle.height, `patch at ${y}`).toBeLessThanOrEqual(nav.y + nav.height);
  }
});
