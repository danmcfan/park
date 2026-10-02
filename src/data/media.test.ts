// Checks the media files themselves, not just the data pointing at them:
// sizes and shapes match what the gallery assumes, nothing is left over from
// an old export, and no metadata (GPS above all) made it into the public repo.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FULL_PX, SMALL_PX, aspectOf, parks, smallSrc } from "./parks";

// Every file under public/media, as site paths ("/media/zion/img-0553.webp").
const published = readdirSync("public/media", { recursive: true })
  .map((f) => `/media/${String(f)}`)
  .filter((f) => statSync(`public${f}`).isFile() && !f.split("/").pop()!.startsWith("."));

const read = (src: string) => new Uint8Array(readFileSync(`public${src}`));
const fourcc = (b: Uint8Array, at: number) => String.fromCharCode(...b.subarray(at, at + 4));
const view = (b: Uint8Array) => new DataView(b.buffer, b.byteOffset, b.byteLength);

// A WebP's RIFF chunk names and pixel size.
function webpInfo(b: Uint8Array) {
  if (fourcc(b, 0) !== "RIFF" || fourcc(b, 8) !== "WEBP") throw new Error("not a WebP");
  const v = view(b);
  const chunks: string[] = [];
  let width = 0;
  let height = 0;
  for (let at = 12; at + 8 <= b.length; at += 8 + v.getUint32(at + 4, true) + (v.getUint32(at + 4, true) & 1)) {
    const name = fourcc(b, at);
    const d = at + 8;
    chunks.push(name);
    if (name === "VP8X") {
      width = 1 + (v.getUint32(d + 4, true) & 0xffffff);
      height = 1 + (v.getUint32(d + 7, true) & 0xffffff);
    } else if (name === "VP8 " && !width) {
      width = v.getUint16(d + 6, true) & 0x3fff;
      height = v.getUint16(d + 8, true) & 0x3fff;
    } else if (name === "VP8L" && !width) {
      const bits = v.getUint32(d + 1, true);
      width = 1 + (bits & 0x3fff);
      height = 1 + ((bits >>> 14) & 0x3fff);
    }
  }
  return { chunks, width, height };
}

// An MP4's box names, depth first, and its tracks' handler types.
const CONTAINERS = new Set(["moov", "trak", "mdia", "minf", "stbl", "udta", "edts"]);
function mp4Info(b: Uint8Array) {
  const v = view(b);
  const boxes: string[] = [];
  const handlers: string[] = [];
  const walk = (from: number, to: number) => {
    for (let at = from; at + 8 <= to; ) {
      let size = v.getUint32(at);
      if (size === 1) size = Number(v.getBigUint64(at + 8));
      else if (size === 0) size = to - at;
      if (size < 8) break;
      const name = fourcc(b, at + 4);
      boxes.push(name);
      if (name === "hdlr") handlers.push(fourcc(b, at + 16));
      if (CONTAINERS.has(name)) walk(at + 8, at + size);
      at += size;
    }
  };
  walk(0, b.length);
  return { boxes, handlers };
}

const items = parks.flatMap((p) => p.photos.filter((i) => i.src));
const photos = items.filter((i) => i.type === "image");
const videos = items.filter((i) => i.type === "video");

describe("photo files", () => {
  it.each(photos.map((i) => [i.src!, i] as const))("%s matches its orientation and size", (src, item) => {
    const { width, height } = webpInfo(read(src));
    expect(Math.max(width, height)).toBeLessThanOrEqual(FULL_PX);
    expect(Math.abs(width / height - aspectOf(item))).toBeLessThan(0.01);
  });

  it.each(photos.map((i) => [smallSrc(i.src!), i] as const))("%s is the small copy, same shape", (src, item) => {
    const { width, height } = webpInfo(read(src));
    expect(Math.max(width, height)).toBe(SMALL_PX);
    expect(Math.abs(width / height - aspectOf(item))).toBeLessThan(0.01);
  });
});

describe("video files", () => {
  if (!videos.length) it.skip("are checked here once the trip has videos", () => {});

  it.each(videos.map((i) => [i.src!, i] as const))("%s is a silent, fast-start clip with no location", (src) => {
    const bytes = read(src);
    const { boxes, handlers } = mp4Info(bytes);
    expect(handlers).toContain("vide");
    expect(handlers, "no audio track").not.toContain("soun");
    expect(boxes.indexOf("moov"), "moov before mdat (+faststart)").toBeLessThan(boxes.indexOf("mdat"));
    const text = Buffer.from(bytes).toString("latin1");
    expect(boxes, "no 3GPP location").not.toContain("loci");
    expect(text.includes("\xa9xyz") || text.includes("ISO6709"), "no QuickTime location").toBe(false);
  });

  it.each(videos.map((i) => [i.poster!, i] as const))("%s is a poster the shape of its video", (src, item) => {
    const { width, height } = webpInfo(read(src));
    expect(Math.abs(width / height - aspectOf(item))).toBeLessThan(0.01);
  });
});

describe("public/media", () => {
  it("holds only files the site uses", () => {
    const used = new Set(items.flatMap((i) => [i.src, i.poster]).filter(Boolean));
    for (const p of photos) used.add(smallSrc(p.src!));
    for (const p of parks) used.add(`/media/badges/${p.slug}.webp`);
    expect(published.filter((f) => !used.has(f))).toEqual([]);
  });

  it("carries no EXIF or XMP metadata in any WebP", () => {
    const webps = published.filter((f) => f.endsWith(".webp"));
    expect(webps.length).toBeGreaterThan(0);
    for (const f of webps) {
      const { chunks } = webpInfo(read(f));
      expect(chunks, f).not.toContain("EXIF");
      expect(chunks, f).not.toContain("XMP ");
    }
  });
});
