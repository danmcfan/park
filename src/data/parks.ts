// The parks, in trip order. Each park's real photos and videos are in
// media.ts (WebP photos ~1600px on the long edge and short 720p MP4 clips in
// public/media/<slug>/, all metadata including GPS stripped); a park with
// none yet shows its placeholder slots from here instead.

import { media } from "./media";

// Everything is shot on an iPhone 17 Pro, so aspect ratios are fixed:
// photos are 4:3 and videos are 16:9, either way up.
export type Orientation = "landscape" | "portrait";
export type MediaType = "image" | "video";

// One print in a gallery. Without `src` it renders as a placeholder.
export interface PhotoSlot {
  type: MediaType;
  orientation: Orientation;
  caption?: string;
  src?: string;
  // Videos only: still frame shown before playback starts.
  poster?: string;
  // The hidden print (see src/data/secret.ts): red-bordered.
  secret?: boolean;
}

const LANDSCAPE_ASPECT: Record<MediaType, number> = { image: 4 / 3, video: 16 / 9 };

// Width / height of an item as displayed.
export const aspectOf = (item: Pick<PhotoSlot, "type" | "orientation">) => {
  const a = LANDSCAPE_ASPECT[item.type];
  return item.orientation === "landscape" ? a : 1 / a;
};

// Each photo comes in three sizes, by long edge: the file at `src`, plus a
// small and a large copy beside it as <name>-800.webp and <name>-2400.webp.
// Gallery prints choose between small and full; full screen can use large.
export const SMALL_PX = 800;
export const FULL_PX = 1600;
export const LARGE_PX = 2400;
export const PHOTO_PX = [SMALL_PX, FULL_PX, LARGE_PX] as const;

// The file for a photo at one of PHOTO_PX.
export const sizedSrc = (src: string, px: number) => (px === FULL_PX ? src : src.replace(/\.webp$/, `-${px}.webp`));

// `srcset` offering a photo at `sizes`, with each file's width worked out
// from its shape. Nothing for placeholders or videos.
export const srcsetOf = (item: PhotoSlot, sizes: readonly number[]) => {
  const { src } = item;
  if (!src || item.type !== "image") return undefined;
  const width = (longEdge: number) => Math.round(longEdge * Math.min(1, aspectOf(item)));
  return sizes.map((px) => `${sizedSrc(src, px)} ${width(px)}w`).join(", ");
};

export interface Park {
  slug: string;
  name: string;
  state: string;
  // Where the park's pin goes on the state outline.
  location: { lat: number; lon: number };
  // The park's color: title stitching and the map pin's head.
  accent: string;
  photos: PhotoSlot[];
}

// Placeholder slots, shown until a park has real media.
const photo = (orientation: Orientation, caption?: string): PhotoSlot => ({ type: "image", orientation, caption });

const trip: Park[] = [
  {
    slug: "zion",
    name: "Zion",
    state: "Utah",
    location: { lat: 37.3, lon: -113.03 },
    accent: "#a8472a", // Navajo sandstone
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
    accent: "#c8642f",
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
    accent: "#3f6b86",
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
    accent: "#2f7d78",
    photos: [
      photo("landscape", "Grand Prismatic from above"),
      photo("portrait", "Old Faithful, on schedule"),
      photo("landscape", "Bison jam in Lamar Valley"),
      photo("landscape", "Lower Falls"),
      photo("portrait", "Morning Glory Pool"),
    ],
  },
];

export const parks: Park[] = trip.map((p) => ({ ...p, photos: media[p.slug] ?? p.photos }));
