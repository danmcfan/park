// Park content. Photos are placeholders until real media is processed into
// media/<slug>/ — then swap `placeholder(...)` for real paths.

// Inline SVG "landscape" placeholder tinted with the park's colors.
const placeholder = (colors, i, w, h) => {
  const [sky, land] = colors;
  const peak = 30 + ((i * 37) % 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${(100 * h) / w}" preserveAspectRatio="none">
<rect width="100%" height="100%" fill="${sky}"/>
<circle cx="${20 + ((i * 23) % 60)}" cy="20" r="7" fill="#fff" opacity=".7"/>
<path d="M0 ${(100 * h) / w} L0 70 L${peak} ${40 + (i % 3) * 8} L${peak + 25} 65 L100 45 L100 ${(100 * h) / w}Z" fill="${land}"/>
<text x="50" y="${(90 * h) / w}" font-family="sans-serif" font-size="5" fill="#fff" opacity=".6" text-anchor="middle">photo ${i + 1}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const makePhotos = (colors, count, captions = {}) =>
  Array.from({ length: count }, (_, i) => {
    const portrait = i % 3 === 1;
    const [w, h] = portrait ? [600, 800] : [800, 600];
    return {
      src: placeholder(colors, i, w, h),
      width: w,
      height: h,
      caption: captions[i],
    };
  });

export const parks = [
  {
    slug: "zion",
    name: "Zion",
    dates: "Day 1–3",
    // Position on the route map (viewBox 0 0 200 300)
    map: { x: 40, y: 272 },
    theme: { board: "#b8553a", accent: "#e8a87c", ink: "#3b1d12", magnet: "#6b8f71" },
    icons: ["mountain", "cactus", "sun", "sheep"],
    journal:
      "Red walls that go straight up. We started early to beat the shuttle crowds and still barely got a seat.",
    photos: makePhotos(["#e8a87c", "#8a3b24"], 14, {
      0: "First look at the canyon",
      3: "The Narrows — cold water, worth it",
      7: "Angels Landing chains",
    }),
  },
  {
    slug: "bryce",
    name: "Bryce Canyon",
    dates: "Day 4–5",
    map: { x: 96, y: 238 },
    theme: { board: "#d9824a", accent: "#f6c9a8", ink: "#4a2410", magnet: "#2f5d62" },
    icons: ["hoodoo", "pine", "star", "moon"],
    journal:
      "Hoodoos everywhere, and the darkest sky we've ever seen. Sunrise at Sunset Point (yes, really).",
    photos: makePhotos(["#f6c9a8", "#b5562a"], 14, {
      1: "Sunrise over the amphitheater",
      5: "Navajo Loop switchbacks",
      9: "Milky Way from the rim",
    }),
  },
  {
    slug: "grand-teton",
    name: "Grand Teton",
    dates: "Day 6–8",
    map: { x: 158, y: 74 },
    theme: { board: "#4a6b82", accent: "#bcd3df", ink: "#14242f", magnet: "#c7683a" },
    icons: ["peaks", "moose", "barn", "canoe"],
    journal:
      "The mountains just appear out of nowhere. Mormon Row at dawn and a moose that did not care about us at all.",
    photos: makePhotos(["#bcd3df", "#2f4a5c"], 14, {
      2: "Mormon Row barn",
      6: "Jenny Lake by canoe",
      10: "Moose!",
    }),
  },
  {
    slug: "yellowstone",
    name: "Yellowstone",
    dates: "Day 9–12",
    map: { x: 170, y: 44 },
    theme: { board: "#3f8a86", accent: "#f2d56b", ink: "#0f2e2c", magnet: "#b5452f" },
    icons: ["geyser", "bison", "spring", "bear"],
    journal:
      "Steam, sulfur, and bison traffic jams. Old Faithful was right on time.",
    photos: makePhotos(["#cfe8e2", "#2a6f6a"], 14, {
      0: "Grand Prismatic from above",
      4: "Old Faithful, on schedule",
      8: "Bison jam in Lamar Valley",
    }),
  },
];
