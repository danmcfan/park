// Pure helpers for the curate tool (no Bun or file system), unit tested in lib.test.ts.
import { aspectOf, type Orientation, type PhotoSlot } from "../src/data/parks";
import type { Item } from "./types";

export const PHOTO_EXT = new Set([".jpg", ".jpeg", ".heic", ".heif", ".png"]);
export const VIDEO_EXT = new Set([".mov", ".mp4", ".m4v"]);

export const extOf = (path: string) => {
  const i = path.lastIndexOf(".");
  return i < 0 ? "" : path.slice(i).toLowerCase();
};
export const stemOf = (path: string) => {
  const base = path.slice(path.lastIndexOf("/") + 1);
  const i = base.lastIndexOf(".");
  return i < 0 ? base : base.slice(0, i);
};

// EXIF GPS: "44/1,58/1,2145/100" with ref "N" → 44.9726.
export function parseExifGps(value: string, ref: string): number | undefined {
  const parts = value.split(",").map((r) => {
    const [n, d = "1"] = r.trim().split("/");
    return Number(n) / Number(d);
  });
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return undefined;
  const deg = parts[0] + parts[1] / 60 + parts[2] / 3600;
  return ref === "S" || ref === "W" ? -deg : deg;
}

// QuickTime location: "+44.9744-110.7043+1912.818/".
export function parseIso6709(value: string): { lat: number; lon: number } | undefined {
  const m = /^([+-]\d+(?:\.\d+)?)([+-]\d+(?:\.\d+)?)/.exec(value);
  return m ? { lat: Number(m[1]), lon: Number(m[2]) } : undefined;
}

// EXIF "2026:09:30 12:12:54" (local time, no zone) → sortable ISO-ish string.
export const exifDate = (value: string) =>
  /^\d{4}:\d\d:\d\d \d\d:\d\d:\d\d/.test(value) ? value.replace(/^(\d{4}):(\d\d):(\d\d) /, "$1-$2-$3T") : undefined;

// Great-circle distance in km.
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * r) / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// The park a shot was taken at, if it's within `maxKm` of one.
export function nearestPark(
  at: { lat: number; lon: number } | undefined,
  parks: { slug: string; location: { lat: number; lon: number } }[],
  maxKm = 150,
): string | undefined {
  if (!at) return undefined;
  let best: { slug: string; d: number } | undefined;
  for (const p of parks) {
    const d = distanceKm(at, p.location);
    if (d <= maxKm && (!best || d < best.d)) best = { slug: p.slug, d };
  }
  return best?.slug;
}

// Largest centered crop of w×h with the site's aspect (4:3 photos, 16:9
// videos) for its orientation.
export function cropBox(type: "image" | "video", w: number, h: number) {
  const orientation: Orientation = w >= h ? "landscape" : "portrait";
  const a = aspectOf({ type, orientation });
  const cw = Math.min(w, Math.round(h * a));
  const ch = Math.min(h, Math.round(w / a));
  return { orientation, w: cw, h: ch, x: Math.floor((w - cw) / 2), y: Math.floor((h - ch) / 2) };
}

// iPhone Live Photos come with a ~3 s .MOV of the same name; hide those by default.
export function liveCompanions(items: { path: string; type: "image" | "video"; duration?: number }[]) {
  const stills = new Set(items.filter((i) => i.type === "image").map((i) => i.path.replace(/\.[^./]+$/, "").toLowerCase()));
  return new Set(
    items
      .filter((i) => i.type === "video" && (i.duration ?? 0) <= 4 && stills.has(i.path.replace(/\.[^./]+$/, "").toLowerCase()))
      .map((i) => i.path),
  );
}

// Public file stems: IMG_0845.HEIC → img-0845, unique within a park.
export function outputStems(paths: string[]) {
  const used = new Map<string, number>();
  return paths.map((p) => {
    const base = stemOf(p).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

// What stops an export: included items without a park, or with a bad clip. Captions are optional.
export function exportProblems(items: Item[]) {
  const problems: string[] = [];
  for (const i of items) {
    if (!i.include) continue;
    if (!(i.park ?? i.suggestedPark)) problems.push(`${i.path}: no park`);
    if (i.type === "video") {
      const { start, end } = clipOf(i);
      if (!(end > start)) problems.push(`${i.path}: clip ends before it starts`);
    }
  }
  return problems;
}

export const clipOf = (i: Item) => {
  const start = Math.max(0, i.start ?? 0);
  const end = Math.min(i.duration ?? Infinity, i.end ?? i.duration ?? 0);
  const poster = Math.min(Math.max(i.poster ?? start, start), end);
  return { start, end, poster };
};

// Contents of src/data/media.ts.
export function mediaModule(byPark: [slug: string, items: PhotoSlot[]][]) {
  const lines = [
    "// Each park's real photos and videos, in gallery order. Written by the curate",
    "// tool's export (curate/); safe to edit by hand once that tool is gone.",
    "// A park with no entry here shows its placeholder grid from parks.ts.",
    'import type { PhotoSlot } from "./parks";',
    "",
    "export const media: Record<string, PhotoSlot[]> = {",
  ];
  for (const [slug, items] of byPark) {
    if (!items.length) continue;
    lines.push(`  ${/^[a-z]\w*$/.test(slug) ? slug : JSON.stringify(slug)}: [`);
    for (const it of items) {
      const fields = Object.entries(it)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
      lines.push(`    { ${fields.join(", ")} },`);
    }
    lines.push("  ],");
  }
  lines.push("};", "");
  return lines.join("\n");
}
