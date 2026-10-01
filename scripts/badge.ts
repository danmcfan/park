// Generate embroidered park badge candidates with Replicate.
//
//   bun scripts/badge.ts <slug> [count]
//
// Needs REPLICATE_API_TOKEN in .env (Bun loads it automatically). Reference
// images are read from raw/badge-refs/ and candidates are written to
// raw/badges/<slug>-<n>.png — raw/ is gitignored, so nothing here is
// committed until a badge is chosen and optimized into public/.

import { parks } from "../src/data/parks";

const MODEL = "openai/gpt-image-2.5-sunburst";
const REFS = ["zion", "bryce", "teton", "yellowstone"].map((n) => `raw/badge-refs/${n}.png`);

// What each badge should show. Kept here rather than in parks.ts because
// it only matters for generation.
const scenes: Record<string, string> = {
  zion:
    "towering red and cream Navajo sandstone cliffs of Zion Canyon (the Watchman peak), " +
    "the Virgin River winding through green cottonwoods at the canyon floor, " +
    "sun rays behind the cliffs in an orange sky",
  bryce:
    "a crowded amphitheater of tall orange, pink and cream hoodoo spires at sunrise, " +
    "with a lone tall hoodoo in front, dark green ponderosa pines along the rim, " +
    "and a pale turquoise sky",
  "grand-teton":
    "the jagged snow-capped granite peaks of the Teton Range rising above a calm lake " +
    "that reflects them, dark green pine forest along the shore, golden autumn grasses " +
    "in the foreground, and a clear blue sky",
  yellowstone:
    "Old Faithful geyser erupting in a tall white plume of steam and water, " +
    "rising from a pale mineral crust basin, dark green lodgepole pine forest behind, " +
    "a lone bison in the foreground, and a soft blue sky",
};

const prompt = (name: string, state: string, scene: string) =>
  [
    `An original embroidered patch badge for ${name} National Park, ${state}.`,
    "Use the reference images only as a guide to the style and composition of park badges:",
    "a classic shield / arrowhead silhouette, a scenic illustration in the top section,",
    "and a bold banner with the lettering below. Do not copy any reference design.",
    `Scene: ${scene}.`,
    `Lettering, embroidered in thread: "${name.toUpperCase()}" large, and "NATIONAL PARK · ${state.toUpperCase()}" smaller.`,
    "It must look like a real, physical embroidered patch: dense satin stitching and fill",
    "stitches with visible thread direction and sheen, a thick raised merrowed border around",
    "the whole edge, a limited palette of thread colors, slight 3D relief.",
    "Photographed flat and straight on, centered, the entire badge visible with a generous",
    "margin, on a pure solid white (#FFFFFF) background with no shadow, no surface, no props,",
    "nothing else in frame, so the badge can be cleanly cut out.",
    "No logos, trademarks, copyright marks, or signatures.",
  ].join(" ");

const token = process.env.REPLICATE_API_TOKEN;
if (!token) throw new Error("REPLICATE_API_TOKEN missing from .env");

const slug = process.argv[2];
const count = Number(process.argv[3] ?? 3);
const park = parks.find((p) => p.slug === slug);
const scene = scenes[slug];
if (!park || !scene) throw new Error(`No park/scene for "${slug}". Known: ${Object.keys(scenes).join(", ")}`);

const dataUri = async (path: string) =>
  `data:image/png;base64,${Buffer.from(await Bun.file(path).arrayBuffer()).toString("base64")}`;

const res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "wait=60" },
  body: JSON.stringify({
    input: {
      prompt: prompt(park.name, park.state, scene),
      input_images: await Promise.all(REFS.map(dataUri)),
      quality: "high",
      background: "opaque",
      aspect_ratio: "1024x1024",
      output_format: "png",
      number_of_images: count,
    },
  }),
});
let prediction = await res.json();
if (!res.ok) throw new Error(`Replicate ${res.status}: ${JSON.stringify(prediction)}`);

while (!["succeeded", "failed", "canceled"].includes(prediction.status)) {
  await Bun.sleep(3000);
  prediction = await (await fetch(prediction.urls.get, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(prediction.status);
}
if (prediction.status !== "succeeded") throw new Error(`Prediction ${prediction.status}: ${prediction.error}`);

const outputs: string[] = [prediction.output].flat();
for (const [i, url] of outputs.entries()) {
  const path = `raw/badges/${slug}-${i + 1}.png`;
  await Bun.write(path, await fetch(url));
  console.log("wrote", path);
}
console.log("predict_time", prediction.metrics?.predict_time, "s");
