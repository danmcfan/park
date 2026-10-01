// Media work: browser previews of the originals (thumbnails, large photos,
// small H.264 proxies for scrubbing) and the export to the site's formats.
// Everything is cached under raw/.curate-cache, keyed by what made it.
import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { parks } from "../src/data/parks";
import type { PhotoSlot } from "../src/data/parks";
import { clipOf, cropBox, exportProblems, mediaModule, outputStems } from "./lib";
import { CACHE, pool, run } from "./scan";
import type { Item } from "./types";

const hash = (v: unknown) => createHash("sha1").update(JSON.stringify(v)).digest("hex").slice(0, 16);

// One build per output file, even if the page asks for it twice at once.
const building = new Map<string, Promise<string>>();
async function cached(dir: string, name: string, make: (out: string) => Promise<unknown>) {
  const out = join(CACHE, dir, name);
  if (await Bun.file(out).exists()) return out;
  let p = building.get(out);
  if (!p) {
    p = (async () => {
      await mkdir(join(CACHE, dir), { recursive: true });
      const tmp = `${out}.tmp${name.slice(name.lastIndexOf("."))}`;
      await make(tmp);
      await Bun.write(out, Bun.file(tmp));
      await rm(tmp);
      return out;
    })().finally(() => building.delete(out));
    building.set(out, p);
  }
  return p;
}

// Previews are slow to make (HEIC decode, video frames), so only a few at once.
let active = 0;
const waiting: (() => void)[] = [];
async function limited<T>(fn: () => Promise<T>) {
  if (active >= 4) await new Promise<void>((r) => waiting.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

const srcKey = async (file: string) => {
  const s = await stat(file);
  return `${s.size}-${s.mtimeMs}`;
};

export async function thumb(file: string, item: Item) {
  const key = hash([file, await srcKey(file)]);
  return cached("thumbs", `${key}.jpg`, (out) =>
    limited(() =>
      item.type === "image"
        ? run(["magick", `${file}[0]`, "-auto-orient", "-thumbnail", "480x480", "-quality", "75", out])
        : run([
            "ffmpeg", "-v", "error", "-y", "-ss", String(Math.min(1, (item.duration ?? 0) / 2)), "-i", file,
            "-frames:v", "1", "-vf", "scale=480:480:force_original_aspect_ratio=decrease", out,
          ]),
    ),
  );
}

// Browsers can't show HEIC, so photos get a large JPEG for the viewer.
export async function large(file: string) {
  const key = hash([file, await srcKey(file)]);
  return cached("large", `${key}.jpg`, (out) =>
    limited(() => run(["magick", `${file}[0]`, "-auto-orient", "-resize", "2000x2000>", "-quality", "85", out])),
  );
}

// A small H.264 copy (with sound) for scrubbing and picking clip points; plays anywhere.
export async function proxy(file: string) {
  const key = hash([file, await srcKey(file)]);
  return cached("proxy", `${key}.mp4`, (out) =>
    limited(() =>
      run([
        "ffmpeg", "-v", "error", "-y", "-i", file, "-map", "0:v:0", "-map", "0:a:0?",
        "-vf", "scale='if(gt(iw,ih),-2,540)':'if(gt(iw,ih),540,-2)'",
        "-c:v", "h264_videotoolbox", "-b:v", "3M", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", out,
      ]),
    ),
  );
}

// ---------- Export ----------

const VERSION = 1; // bump when the output commands change, to rebuild everything

async function buildPhoto(file: string, item: Item) {
  const box = cropBox("image", item.width!, item.height!);
  const key = hash([VERSION, "photo", file, await srcKey(file), box]);
  const out = await cached("out", `${key}.webp`, (o) =>
    run([
      "magick", `${file}[0]`, "-auto-orient", "-gravity", "center", "-crop", `${box.w}x${box.h}+0+0`, "+repage",
      "-resize", "1600x1600>", "-strip", "-quality", "82", o,
    ]),
  );
  return { orientation: box.orientation, files: { "": out } };
}

async function buildVideo(file: string, item: Item) {
  const box = cropBox("video", item.width!, item.height!);
  const { start, end, poster } = clipOf(item);
  const vf = [
    `crop=${box.w}:${box.h}:${box.x}:${box.y}`,
    box.orientation === "landscape" ? "scale=-2:720" : "scale=720:-2",
  ];
  const key = hash([VERSION, "video", file, await srcKey(file), box, start, end]);
  const mp4 = await cached("out", `${key}.mp4`, (o) =>
    run([
      "ffmpeg", "-v", "error", "-y", "-ss", String(start), "-i", file, "-t", String(end - start),
      "-map", "0:v:0", "-an", "-map_metadata", "-1", "-map_chapters", "-1",
      "-vf", [...vf, "fps=30"].join(","),
      "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", o,
    ]),
  );
  const pkey = hash([VERSION, "poster", file, await srcKey(file), box, poster]);
  const png = await cached("out", `${pkey}.png`, (o) =>
    run(["ffmpeg", "-v", "error", "-y", "-ss", String(poster), "-i", file, "-frames:v", "1", "-vf", vf.join(","), o]),
  );
  const webp = await cached("out", `${pkey}.webp`, (o) => run(["magick", png, "-strip", "-quality", "82", o]));
  return { orientation: box.orientation, files: { "": mp4, "-poster": webp } };
}

// Builds every included item into public/media/<park>/, makes those folders
// hold exactly that, and rewrites src/data/media.ts.
export async function exportAll(dump: string, items: Item[], log: (line: string) => void) {
  const problems = exportProblems(items);
  if (problems.length) {
    log(`Fix these first:\n  ${problems.join("\n  ")}`);
    return false;
  }
  const chosen = items.filter((i) => i.include);
  const byPark = parks.map((p) => ({ slug: p.slug, items: chosen.filter((i) => (i.park ?? i.suggestedPark) === p.slug) }));
  const total = chosen.length;
  log(`Exporting ${total} item${total === 1 ? "" : "s"}…`);

  let done = 0;
  const media: [string, PhotoSlot[]][] = [];
  for (const { slug, items: list } of byPark) {
    const stems = outputStems(list.map((i) => i.path));
    const built = await pool(list, 3, async (item) => {
      const file = join(dump, item.path);
      const b = item.type === "image" ? await buildPhoto(file, item) : await buildVideo(file, item);
      log(`  [${++done}/${total}] ${slug}: ${item.path}`);
      return b;
    });

    const dir = join("public/media", slug);
    await mkdir(dir, { recursive: true });
    const keep = new Set<string>();
    const slots: PhotoSlot[] = [];
    for (const [n, item] of list.entries()) {
      const b = built[n];
      const ext = item.type === "image" ? ".webp" : ".mp4";
      const names = Object.entries(b.files).map(([suffix, from]) => {
        const name = `${stems[n]}${suffix}${suffix ? ".webp" : ext}`;
        keep.add(name);
        return [name, from] as const;
      });
      for (const [name, from] of names) await copyFile(from, join(dir, name));
      const src = `/media/${slug}/${names[0][0]}`;
      slots.push(
        item.type === "image"
          ? { type: "image", orientation: b.orientation, caption: item.caption?.trim() || undefined, src }
          : { type: "video", orientation: b.orientation, caption: item.caption?.trim() || undefined, src, poster: `/media/${slug}/${names[1][0]}` },
      );
    }
    for (const f of await readdir(dir)) if (!keep.has(f)) await rm(join(dir, f));
    if (!list.length) await rm(dir, { recursive: true });
    media.push([slug, slots]);
  }

  await Bun.write("src/data/media.ts", mediaModule(media));
  log(`Done: ${media.map(([s, l]) => `${s} ${l.length}`).join(", ")}. Wrote src/data/media.ts.`);
  return true;
}
