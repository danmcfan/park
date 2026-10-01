// All site content lives here. Media without `src` renders as a placeholder.
// Real media lives in public/media/<slug>/: WebP photos (~1600px long edge)
// and short 720p MP4 clips, with all metadata (including GPS) stripped. Which
// ones show, and in what order, is in media.ts; until a park has real media
// it shows the placeholder grid below.

import type { IconName } from "../components/Icon";
import { media } from "./media";

// Everything is shot on an iPhone 17 Pro, so aspect ratios are fixed:
// photos are 4:3 and videos are 16:9, either way up.
export type Orientation = "landscape" | "portrait";
export type MediaType = "image" | "video";

export interface PhotoSlot {
  type: MediaType;
  orientation: Orientation;
  caption?: string;
  src?: string;
  // Videos only: still frame shown before playback starts.
  poster?: string;
}

const LANDSCAPE_ASPECT: Record<MediaType, number> = { image: 4 / 3, video: 16 / 9 };

// Width / height of an item as displayed.
export const aspectOf = (item: PhotoSlot) => {
  const a = LANDSCAPE_ASPECT[item.type];
  return item.orientation === "landscape" ? a : 1 / a;
};

export interface Park {
  slug: string;
  name: string;
  state: string;
  // Where the park's pin goes on the state outline.
  location: { lat: number; lon: number };
  theme: { accent: string; deep: string; soft: string; board: string };
  icons: IconName[];
  hero: PhotoSlot;
  journal: string;
  facts: { label: string; value: string }[];
  photos: PhotoSlot[];
}

export interface Leg {
  miles: number;
  time: string;
}

// Placeholder slots, shown until a park has real media.
const photo = (orientation: Orientation, caption?: string): PhotoSlot => ({ type: "image", orientation, caption });

const placeholders: Park[] = [
  {
    slug: "zion",
    name: "Zion",
    state: "Utah",
    location: { lat: 37.3, lon: -113.03 },
    theme: {
      accent: "#a8472a", // Navajo sandstone
      deep: "#5a2417",
      soft: "#e9c9b2",
      board: "#7a3a26",
    },
    icons: ["canyon", "sun", "river", "cactus"],
    hero: photo("landscape", "The Virgin River below the Watchman at sunset"),
    journal:
      "Red walls that go straight up. We started early to beat the shuttle crowds, waded the Narrows until our feet went numb, and watched the Watchman light up from the bridge every evening.",
    facts: [
      { label: "Nights", value: "3" },
      { label: "Best hike", value: "The Narrows" },
      { label: "Miles hiked", value: "21" },
      { label: "Wildlife", value: "Bighorn sheep" },
    ],
    photos: [
      photo("landscape", "First look down the main canyon"),
      photo("portrait", "Angels Landing chains"),
      photo("landscape", "Shuttle stop at Big Bend"),
      photo("portrait", "The Narrows — cold, worth it"),
      photo("landscape", "Canyon Overlook at sunrise"),
      photo("landscape", "Checkerboard Mesa"),
      photo("landscape", "Emerald Pools trail"),
      photo("portrait", "Weeping Rock"),
      photo("landscape", "Bighorn on the east side"),
    ],
  },
  {
    slug: "bryce",
    name: "Bryce Canyon",
    state: "Utah",
    location: { lat: 37.57, lon: -112.18 },
    theme: { accent: "#c8642f", deep: "#5c2c12", soft: "#f3d6bf", board: "#8a4a26" },
    icons: ["hoodoo", "pine", "star", "moon"],
    hero: photo("landscape", "Sunrise over the Bryce Amphitheater"),
    journal:
      "Hoodoos everywhere, and the darkest sky we've ever seen. Sunrise at Sunset Point (yes, really).",
    facts: [
      { label: "Nights", value: "2" },
      { label: "Best hike", value: "Navajo Loop" },
      { label: "Elevation", value: "8,000 ft" },
      { label: "Night sky", value: "Milky Way" },
    ],
    photos: [
      photo("landscape", "Sunrise over the amphitheater"),
      photo("portrait", "Thor's Hammer"),
      photo("landscape", "Wall Street switchbacks"),
      photo("landscape", "Milky Way from the rim"),
      photo("portrait", "Queens Garden"),
      photo("landscape", "Natural Bridge"),
    ],
  },
  {
    slug: "grand-teton",
    name: "Grand Teton",
    state: "Wyoming",
    location: { lat: 43.79, lon: -110.68 },
    theme: { accent: "#3f6b86", deep: "#15293a", soft: "#cfdde6", board: "#2d4a5e" },
    icons: ["peaks", "moose", "barn", "canoe"],
    hero: photo("landscape", "The Cathedral Group from Teton Point"),
    journal:
      "The mountains just appear out of nowhere. Mormon Row at dawn and a moose that did not care about us at all.",
    facts: [
      { label: "Nights", value: "3" },
      { label: "Best hike", value: "Cascade Canyon" },
      { label: "Summit", value: "13,775 ft" },
      { label: "Wildlife", value: "Moose" },
    ],
    photos: [
      photo("landscape", "Mormon Row barn"),
      photo("portrait", "Jenny Lake by canoe"),
      photo("landscape", "Moose!"),
      photo("landscape", "Oxbow Bend"),
      photo("portrait", "Cascade Canyon"),
      photo("landscape", "Schwabacher Landing"),
    ],
  },
  {
    slug: "yellowstone",
    name: "Yellowstone",
    state: "Wyoming",
    location: { lat: 44.6, lon: -110.55 },
    theme: { accent: "#2f7d78", deep: "#0f2e2c", soft: "#cfe6e2", board: "#255e5a" },
    icons: ["geyser", "bison", "spring", "bear"],
    hero: photo("landscape", "Grand Prismatic Spring from the overlook"),
    journal: "Steam, sulfur, and bison traffic jams. Old Faithful was right on time.",
    facts: [
      { label: "Nights", value: "4" },
      { label: "Geysers seen", value: "12" },
      { label: "Best stop", value: "Lamar Valley" },
      { label: "Wildlife", value: "Bison" },
    ],
    photos: [
      photo("landscape", "Grand Prismatic from above"),
      photo("portrait", "Old Faithful, on schedule"),
      photo("landscape", "Bison jam in Lamar Valley"),
      photo("landscape", "Lower Falls"),
      photo("portrait", "Morning Glory Pool"),
    ],
  },
];

export const parks: Park[] = placeholders.map((p) => ({ ...p, photos: media[p.slug] ?? p.photos }));

// Driving legs between consecutive parks (approximate).
export const legs: Leg[] = [
  { miles: 85, time: "1 hr 45 min" },
  { miles: 530, time: "8 hr" },
  { miles: 60, time: "1 hr 15 min" },
];
