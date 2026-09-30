// All site content lives here. Photos are placeholders until real media is
// processed into public/media/<slug>/ — set `src` on a photo to swap it in.

// Photo slot helper. `shape` drives the board layout: "wide" (3:2),
// "tall" (4:5) or "square".
const slot = (shape, caption, src) => ({ shape, caption, src });

export const parks = [
  {
    slug: "zion",
    name: "Zion",
    state: "Utah",
    dates: "Days 1–3",
    map: { x: 40, y: 272 },
    theme: {
      accent: "#a8472a", // Navajo sandstone
      deep: "#5a2417",
      soft: "#e9c9b2",
      board: "#7a3a26",
    },
    icons: ["canyon", "sun", "river", "cactus"],
    hero: slot("wide", "The Virgin River below the Watchman at sunset"),
    journal:
      "Red walls that go straight up. We started early to beat the shuttle crowds, waded the Narrows until our feet went numb, and watched the Watchman light up from the bridge every evening.",
    facts: [
      { label: "Nights", value: "3" },
      { label: "Best hike", value: "The Narrows" },
      { label: "Miles hiked", value: "21" },
      { label: "Wildlife", value: "Bighorn sheep" },
    ],
    photos: [
      slot("wide", "First look down the main canyon"),
      slot("tall", "Angels Landing chains"),
      slot("square", "Shuttle stop at Big Bend"),
      slot("tall", "The Narrows — cold, worth it"),
      slot("wide", "Canyon Overlook at sunrise"),
      slot("square", "Checkerboard Mesa"),
      slot("wide", "Emerald Pools trail"),
      slot("tall", "Weeping Rock"),
      slot("square", "Bighorn on the east side"),
    ],
  },
  {
    slug: "bryce",
    name: "Bryce Canyon",
    state: "Utah",
    dates: "Days 4–5",
    map: { x: 96, y: 238 },
    theme: { accent: "#c8642f", deep: "#5c2c12", soft: "#f3d6bf", board: "#8a4a26" },
    icons: ["hoodoo", "pine", "star", "moon"],
    hero: slot("wide", "Sunrise over the Bryce Amphitheater"),
    journal:
      "Hoodoos everywhere, and the darkest sky we've ever seen. Sunrise at Sunset Point (yes, really).",
    facts: [
      { label: "Nights", value: "2" },
      { label: "Best hike", value: "Navajo Loop" },
      { label: "Elevation", value: "8,000 ft" },
      { label: "Night sky", value: "Milky Way" },
    ],
    photos: [
      slot("wide", "Sunrise over the amphitheater"),
      slot("tall", "Thor's Hammer"),
      slot("square", "Wall Street switchbacks"),
      slot("wide", "Milky Way from the rim"),
      slot("tall", "Queens Garden"),
      slot("square", "Natural Bridge"),
    ],
  },
  {
    slug: "grand-teton",
    name: "Grand Teton",
    state: "Wyoming",
    dates: "Days 6–8",
    map: { x: 158, y: 74 },
    theme: { accent: "#3f6b86", deep: "#15293a", soft: "#cfdde6", board: "#2d4a5e" },
    icons: ["peaks", "moose", "barn", "canoe"],
    hero: slot("wide", "The Cathedral Group from Teton Point"),
    journal:
      "The mountains just appear out of nowhere. Mormon Row at dawn and a moose that did not care about us at all.",
    facts: [
      { label: "Nights", value: "3" },
      { label: "Best hike", value: "Cascade Canyon" },
      { label: "Summit", value: "13,775 ft" },
      { label: "Wildlife", value: "Moose" },
    ],
    photos: [
      slot("wide", "Mormon Row barn"),
      slot("tall", "Jenny Lake by canoe"),
      slot("square", "Moose!"),
      slot("wide", "Oxbow Bend"),
      slot("tall", "Cascade Canyon"),
      slot("square", "Schwabacher Landing"),
    ],
  },
  {
    slug: "yellowstone",
    name: "Yellowstone",
    state: "Wyoming",
    dates: "Days 9–12",
    map: { x: 170, y: 44 },
    theme: { accent: "#2f7d78", deep: "#0f2e2c", soft: "#cfe6e2", board: "#255e5a" },
    icons: ["geyser", "bison", "spring", "bear"],
    hero: slot("wide", "Grand Prismatic Spring from the overlook"),
    journal: "Steam, sulfur, and bison traffic jams. Old Faithful was right on time.",
    facts: [
      { label: "Nights", value: "4" },
      { label: "Geysers seen", value: "12" },
      { label: "Best stop", value: "Lamar Valley" },
      { label: "Wildlife", value: "Bison" },
    ],
    photos: [
      slot("wide", "Grand Prismatic from above"),
      slot("tall", "Old Faithful, on schedule"),
      slot("square", "Bison jam in Lamar Valley"),
      slot("wide", "Lower Falls"),
      slot("tall", "Morning Glory Pool"),
      slot("square", "Mammoth terraces"),
    ],
  },
];

// Driving legs between consecutive parks (approximate).
export const legs = [
  { miles: 85, time: "1 hr 45 min" },
  { miles: 530, time: "8 hr" },
  { miles: 60, time: "1 hr 15 min" },
];
