// Local-only curate tool: pick which photos and videos from the trip dump go
// on the site, clip the videos, then export them to public/media/ and
// src/data/media.ts. Run with `bun run curate [dump folder]` (default raw/dump).
// See curate/README.md; delete the whole folder when the site is done.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { parks } from "../src/data/parks";
import page from "./index.html";
import { exportAll, large, proxy, thumb } from "./process";
import { scan } from "./scan";
import type { Choice, Item, Scanned } from "./types";

const dump = resolve(process.argv[2] ?? "raw/dump");
const CHOICES = "raw/curate.json";
const PORT = 5199;

if (!existsSync(dump)) {
  console.error(`No dump folder at ${dump}. Put the trip's photos and videos there, or pass a folder.`);
  process.exit(1);
}

console.log(`Scanning ${dump}…`);
let scanned: Scanned[] = await scan(dump);
const byId = () => new Map(scanned.map((s) => [s.id, s]));
let index = byId();

// Choices are keyed by path so they survive rescans.
const file = Bun.file(CHOICES);
const choices: Record<string, Choice> = (await file.exists()) ? await file.json() : {};
let saving = Promise.resolve();
const save = () => (saving = saving.then(() => Bun.write(CHOICES, JSON.stringify(choices, null, 1)).then(() => {})));

const items = (): Item[] => scanned.map((s) => ({ ...s, ...choices[s.path] }));

const notFound = () => new Response("Not found", { status: 404 });

// Looks up an item by id and hands it, with its file's full path, to `fn`.
const withItem = (id: string, fn: (item: Item, path: string) => Response | Promise<Response>) => {
  const s = index.get(id);
  return s ? fn({ ...s, ...choices[s.path] }, resolve(dump, s.path)) : notFound();
};

const serveFile = async (path: Promise<string>, type: string) =>
  new Response(Bun.file(await path), { headers: { "Content-Type": type, "Cache-Control": "max-age=3600" } });

let exporting = false;

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: PORT,
  development: true,
  routes: {
    "/": page,
    "/api/items": {
      GET: () =>
        Response.json({ dump, parks: parks.map((p) => ({ slug: p.slug, name: p.name })), items: items() }),
    },
    "/api/items/:id": {
      PUT: (req) =>
        withItem(req.params.id, async (item) => {
          // null or "" clears a choice.
          const next = { ...choices[item.path], ...((await req.json()) as Choice) };
          for (const k of Object.keys(next) as (keyof Choice)[]) if (next[k] === null || next[k] === "") delete next[k];
          choices[item.path] = next;
          await save();
          return Response.json({ ...item, ...next });
        }),
    },
    "/api/rescan": {
      POST: async () => {
        scanned = await scan(dump);
        index = byId();
        return Response.json({ items: items() });
      },
    },
    "/api/export": {
      POST: () => {
        if (exporting) return new Response("An export is already running.\n", { status: 409 });
        exporting = true;
        const enc = new TextEncoder();
        const stream = new ReadableStream({
          async start(c) {
            const log = (line: string) => {
              console.log(line);
              c.enqueue(enc.encode(`${line}\n`));
            };
            try {
              await exportAll(dump, items(), log);
            } catch (e) {
              log(`Export failed: ${(e as Error).message}`);
            } finally {
              exporting = false;
              c.close();
            }
          },
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      },
    },
    "/thumb/:id": (req) => withItem(req.params.id, (item, path) => serveFile(thumb(path, item), "image/jpeg")),
    "/large/:id": (req) => withItem(req.params.id, (_, path) => serveFile(large(path), "image/jpeg")),
    "/proxy/:id": (req) => withItem(req.params.id, (_, path) => serveFile(proxy(path), "video/mp4")),
  },
  error(e) {
    console.error(e);
    return new Response(String(e), { status: 500 });
  },
});

console.log(`${scanned.length} photos and videos. Curate at ${server.url}`);
