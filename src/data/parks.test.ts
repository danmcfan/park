import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aspectOf, parks } from "./parks";

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

  it("gives every video a poster and every real item a caption", () => {
    for (const { item } of allMedia) {
      if (item.type === "video" && item.src) expect(item.poster, item.src).toBeTruthy();
      if (item.src) expect(item.caption, item.src).toBeTruthy();
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
