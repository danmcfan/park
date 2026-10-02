import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { media } from "./media";
import { aspectOf, parks, smallSrc, srcsetOf } from "./parks";

const inPublic = (src: string) => existsSync(`public${src}`);
const allMedia = parks.flatMap((p) => p.photos.map((item) => ({ park: p.slug, item })));

describe("parks data", () => {
  it("has unique slugs", () => {
    const slugs = parks.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has a badge image for every park", () => {
    for (const p of parks) expect(inPublic(`/media/badges/${p.slug}.webp`), p.slug).toBe(true);
  });

  it("points every media src and poster at a file that exists", () => {
    for (const { park, item } of allMedia) {
      if (item.src) expect(inPublic(item.src), `${park}: ${item.src}`).toBe(true);
      if (item.poster) expect(inPublic(item.poster), `${park}: ${item.poster}`).toBe(true);
    }
  });

  it("keeps real media under its park's folder", () => {
    for (const { park, item } of allMedia)
      if (item.src) expect(item.src.startsWith(`/media/${park}/`), item.src).toBe(true);
  });

  it("gives every video a poster", () => {
    for (const { item } of allMedia) {
      if (item.type === "video" && item.src) expect(item.poster, item.src).toBeTruthy();
    }
  });
});

describe("aspectOf", () => {
  it("uses iPhone 17 Pro ratios for both orientations", () => {
    expect(aspectOf({ type: "image", orientation: "landscape" })).toBeCloseTo(4 / 3);
    expect(aspectOf({ type: "image", orientation: "portrait" })).toBeCloseTo(3 / 4);
    expect(aspectOf({ type: "video", orientation: "landscape" })).toBeCloseTo(16 / 9);
    expect(aspectOf({ type: "video", orientation: "portrait" })).toBeCloseTo(9 / 16);
  });
});

describe("srcsetOf", () => {
  it("offers the small and full photo with their true widths", () => {
    expect(smallSrc("/media/zion/img-1.webp")).toBe("/media/zion/img-1-800.webp");
    expect(srcsetOf({ type: "image", orientation: "landscape", src: "/media/zion/img-1.webp" })).toBe(
      "/media/zion/img-1-800.webp 800w, /media/zion/img-1.webp 1600w",
    );
    expect(srcsetOf({ type: "image", orientation: "portrait", src: "/media/zion/img-2.webp" })).toBe(
      "/media/zion/img-2-800.webp 600w, /media/zion/img-2.webp 1200w",
    );
  });
});

describe("media", () => {
  it("only lists parks that exist, and only real media", () => {
    const slugs = new Set(parks.map((p) => p.slug));
    for (const [slug, items] of Object.entries(media)) {
      expect(slugs.has(slug), slug).toBe(true);
      for (const item of items) expect(item.src, slug).toBeTruthy();
    }
  });

  it("is what each park shows", () => {
    for (const p of parks) if (media[p.slug]) expect(p.photos).toBe(media[p.slug]);
  });
});
