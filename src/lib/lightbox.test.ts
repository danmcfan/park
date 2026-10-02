import { describe, expect, it } from "vitest";
import { lightboxWidth } from "./lightbox";

describe("lightboxWidth", () => {
  it("fills the width when the media is wide for the window", () => {
    // iPhone: 393 × 852, padding clamps to 4vw.
    expect(lightboxWidth(393, 852, 4 / 3)).toBeCloseTo(393 - 2 * 0.04 * 393);
  });

  it("fits the height above the caption when the media is tall", () => {
    // 1280 × 800 desktop: padding 51.2px, caption 56px.
    expect(lightboxWidth(1280, 800, 3 / 4)).toBeCloseTo((800 - 2 * 51.2 - 56) * 0.75);
  });

  it("keeps padding between 12px and 56px", () => {
    expect(lightboxWidth(200, 2000, 1)).toBeCloseTo(200 - 24);
    expect(lightboxWidth(3000, 10000, 1)).toBeCloseTo(3000 - 112);
  });
});
