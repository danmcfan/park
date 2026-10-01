import { test as base, expect, type Page } from "@playwright/test";

// Every test fails if the page throws or logs a console error.
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      // WebKit's headless build can't load icons for its own native video
      // controls; that's the browser, not the page.
      if (m.type() === "error" && !/Button failed to load, iconName = .*-placard/.test(m.text())) errors.push(m.text());
    });
    await use(page);
    expect(errors, "page errors").toEqual([]);
  },
});

export { expect };

export const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 900;

// Layout boxes ignore CSS transforms, so tilted prints still measure square.
export const layoutBox = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) =>
    els.map((el) => {
      const e = el as HTMLElement;
      let left = 0;
      let top = 0;
      for (let n: HTMLElement | null = e; n; n = n.offsetParent as HTMLElement | null) {
        left += n.offsetLeft;
        top += n.offsetTop;
      }
      return { left, top, width: e.offsetWidth, height: e.offsetHeight };
    }),
  );
