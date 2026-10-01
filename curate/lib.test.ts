import { describe, expect, it } from "vitest";
import { parks } from "../src/data/parks";
import {
  clipOf,
  cropBox,
  exifDate,
  exportProblems,
  liveCompanions,
  mediaModule,
  nearestPark,
  outputStems,
  parseExifGps,
  parseIso6709,
} from "./lib";
import type { Item } from "./types";

const item = (o: Partial<Item>): Item => ({ id: "x", path: "a.jpg", type: "image", ...o });

describe("metadata parsing", () => {
  it("reads EXIF GPS rationals with their hemisphere", () => {
    expect(parseExifGps("44/1,58/1,2145/100", "N")).toBeCloseTo(44.97263, 4);
    expect(parseExifGps("110/1,42/1,1490/100", "W")).toBeCloseTo(-110.70414, 4);
    expect(parseExifGps("junk", "N")).toBeUndefined();
  });

  it("reads QuickTime ISO 6709 locations", () => {
    expect(parseIso6709("+44.9744-110.7043+1912.818/")).toEqual({ lat: 44.9744, lon: -110.7043 });
    expect(parseIso6709("")).toBeUndefined();
  });

  it("turns EXIF dates into sortable strings", () => {
    expect(exifDate("2026:09:30 12:12:54")).toBe("2026-09-30T12:12:54");
    expect(exifDate("")).toBeUndefined();
  });
});

describe("nearestPark", () => {
  it("finds the park a shot was taken in", () => {
    expect(nearestPark({ lat: 44.9744, lon: -110.7043 }, parks)).toBe("yellowstone"); // Mammoth
    expect(nearestPark({ lat: 37.2, lon: -112.98 }, parks)).toBe("zion"); // Springdale
    expect(nearestPark({ lat: 37.62, lon: -112.17 }, parks)).toBe("bryce");
    expect(nearestPark({ lat: 43.75, lon: -110.72 }, parks)).toBe("grand-teton"); // Jenny Lake
  });

  it("leaves shots far from every park unassigned", () => {
    expect(nearestPark({ lat: 40.76, lon: -111.89 }, parks)).toBeUndefined(); // Salt Lake City
    expect(nearestPark(undefined, parks)).toBeUndefined();
  });
});

describe("cropBox", () => {
  it("leaves iPhone-shaped media alone", () => {
    expect(cropBox("image", 4032, 3024)).toEqual({ orientation: "landscape", w: 4032, h: 3024, x: 0, y: 0 });
    expect(cropBox("video", 1080, 1920)).toEqual({ orientation: "portrait", w: 1080, h: 1920, x: 0, y: 0 });
  });

  it("crops the middle of anything else to the site's aspect", () => {
    expect(cropBox("image", 3024, 3024)).toEqual({ orientation: "landscape", w: 3024, h: 2268, x: 0, y: 378 });
    expect(cropBox("video", 1920, 1440)).toEqual({ orientation: "landscape", w: 1920, h: 1080, x: 0, y: 180 });
    expect(cropBox("image", 1170, 2532)).toEqual({ orientation: "portrait", w: 1170, h: 1560, x: 0, y: 486 });
  });
});

describe("liveCompanions", () => {
  it("flags short videos that share a still's name", () => {
    const live = liveCompanions([
      { path: "d/IMG_1.HEIC", type: "image" },
      { path: "d/IMG_1.MOV", type: "video", duration: 2.8 },
      { path: "d/IMG_2.MOV", type: "video", duration: 2.8 },
      { path: "d/IMG_3.JPG", type: "image" },
      { path: "d/IMG_3.MOV", type: "video", duration: 30 },
    ]);
    expect([...live]).toEqual(["d/IMG_1.MOV"]);
  });
});

describe("outputStems", () => {
  it("makes web-safe, unique names", () => {
    expect(outputStems(["a/IMG_0845.HEIC", "b/IMG_0845.JPG", "IMG 9 (1).mov"])).toEqual([
      "img-0845",
      "img-0845-2",
      "img-9-1",
    ]);
  });
});

describe("clips and export checks", () => {
  it("clamps clips to the video and keeps the poster inside the clip", () => {
    expect(clipOf(item({ type: "video", duration: 10 }))).toEqual({ start: 0, end: 10, poster: 0 });
    expect(clipOf(item({ type: "video", duration: 10, start: 2, end: 20, poster: 1 }))).toEqual({ start: 2, end: 10, poster: 2 });
  });

  it("needs a park for everything included, but not a caption", () => {
    expect(exportProblems([item({ include: true, suggestedPark: "zion", caption: "Hi" }), item({ path: "b.jpg" })])).toEqual([]);
    expect(exportProblems([item({ include: true, caption: " " })])).toEqual(["a.jpg: no park"]);
    expect(
      exportProblems([item({ include: true, park: "zion", caption: "c", type: "video", duration: 5, start: 4, end: 3 })]),
    ).toEqual(["a.jpg: clip ends before it starts"]);
  });
});

describe("mediaModule", () => {
  it("writes a module listing each park's media, skipping empty parks", () => {
    const src = mediaModule([
      ["zion", [{ type: "image", orientation: "portrait", caption: 'The "Narrows"', src: "/media/zion/a.webp" }]],
      ["bryce", []],
      ["grand-teton", [{ type: "video", orientation: "landscape", caption: "c", src: "/media/grand-teton/b.mp4", poster: "/media/grand-teton/b-poster.webp" }]],
    ]);
    expect(src).toContain('  zion: [\n    { type: "image", orientation: "portrait", caption: "The \\"Narrows\\"", src: "/media/zion/a.webp" },');
    expect(src).toContain('  "grand-teton": [');
    expect(src).not.toContain("bryce");
  });
});
