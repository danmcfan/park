import type { PhotoSlot } from "./parks";

// The hidden print: dragging the park's map pin into the "O" of the state's
// name swaps it into the gallery in place of the print at `replaces`.
// Kept out of public/media/<park>/, which the curate export rewrites.
export const secret: { park: string; letter: string; replaces: number; item: PhotoSlot } = {
  park: "yellowstone",
  letter: "O",
  replaces: 1,
  item: { type: "image", orientation: "landscape", src: "/media/secret/img-7825.webp" },
};
