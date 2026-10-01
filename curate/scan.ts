// Finds every photo and video in the dump and reads what we need from each
// (capture time, GPS, size, duration). Results are cached by size + mtime, so
// only new or changed files are read again.
import { createHash } from "node:crypto";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { parks } from "../src/data/parks";
import {
  PHOTO_EXT,
  VIDEO_EXT,
  exifDate,
  extOf,
  liveCompanions,
  nearestPark,
  parseExifGps,
  parseIso6709,
} from "./lib";
import type { Scanned } from "./types";

export const CACHE = "raw/.curate-cache";

export const idOf = (path: string) => createHash("sha1").update(path).digest("hex").slice(0, 12);

export async function run(cmd: string[]) {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`${cmd[0]} failed (${code}): ${err.trim().split("\n").slice(-3).join(" ")}`);
  return out;
}

// Runs `fn` over `items` with at most `n` at a time.
export async function pool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>) {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (PHOTO_EXT.has(extOf(e.name)) || VIDEO_EXT.has(extOf(e.name))) out.push(p);
  }
  return out;
}

type Meta = Omit<Scanned, "id" | "path" | "live" | "suggestedPark">;

async function photoMeta(file: string): Promise<Meta> {
  const f = "%[EXIF:DateTimeOriginal]|%[EXIF:GPSLatitude]|%[EXIF:GPSLatitudeRef]|%[EXIF:GPSLongitude]|%[EXIF:GPSLongitudeRef]|%w|%h|%[EXIF:Orientation]";
  const out = await run(["magick", "identify", "-ping", "-format", `${f}\n`, file]);
  const [date, lat, latRef, lon, lonRef, w, h, orient] = out.split("\n")[0].split("|");
  // EXIF orientations 5–8 are turned a quarter, so width and height swap.
  const turned = Number(orient) >= 5;
  return {
    type: "image",
    taken: exifDate(date),
    lat: lat ? parseExifGps(lat, latRef) : undefined,
    lon: lon ? parseExifGps(lon, lonRef) : undefined,
    width: Number(turned ? h : w),
    height: Number(turned ? w : h),
  };
}

async function videoMeta(file: string): Promise<Meta> {
  const out = await run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", file]);
  const d = JSON.parse(out);
  const tags = d.format?.tags ?? {};
  const v = d.streams.find((s: { codec_type: string }) => s.codec_type === "video");
  const rotation = Number(
    v?.side_data_list?.find((s: { rotation?: number }) => s.rotation !== undefined)?.rotation ?? v?.tags?.rotate ?? 0,
  );
  const turned = Math.abs(rotation) % 180 === 90;
  const loc = parseIso6709(tags["com.apple.quicktime.location.ISO6709"] ?? "");
  // creationdate is local time with a zone; drop the zone to match photos.
  const taken = (tags["com.apple.quicktime.creationdate"] ?? tags.creation_time ?? "").slice(0, 19) || undefined;
  return {
    type: "video",
    taken,
    lat: loc?.lat,
    lon: loc?.lon,
    width: turned ? v?.height : v?.width,
    height: turned ? v?.width : v?.height,
    duration: Number(d.format?.duration) || undefined,
  };
}

export async function scan(dump: string): Promise<Scanned[]> {
  await mkdir(CACHE, { recursive: true });
  const cacheFile = Bun.file(join(CACHE, "meta.json"));
  const cache: Record<string, { key: string; meta: Meta }> = (await cacheFile.exists()) ? await cacheFile.json() : {};

  const files = await walk(dump);
  let done = 0;
  const metas = await pool(files, 8, async (file) => {
    const path = relative(dump, file);
    const s = await stat(file);
    const key = `${s.size}-${s.mtimeMs}`;
    let meta = cache[path]?.key === key ? cache[path].meta : undefined;
    if (!meta) {
      try {
        meta = VIDEO_EXT.has(extOf(file)) ? await videoMeta(file) : await photoMeta(file);
      } catch (e) {
        console.warn(`  skipped ${path}: ${(e as Error).message}`);
        return undefined;
      }
      cache[path] = { key, meta };
    }
    if (++done % 50 === 0) console.log(`  read ${done}/${files.length}`);
    return { id: idOf(path), path, ...meta } satisfies Scanned;
  });
  await Bun.write(cacheFile, JSON.stringify(cache));

  const items = metas.filter((m): m is Scanned => !!m);
  const live = liveCompanions(items);
  for (const i of items) {
    i.live = live.has(i.path) || undefined;
    i.suggestedPark = nearestPark(i.lat !== undefined && i.lon !== undefined ? { lat: i.lat, lon: i.lon } : undefined, parks);
  }
  return items.sort((a, b) => (a.taken ?? "").localeCompare(b.taken ?? "") || a.path.localeCompare(b.path));
}
