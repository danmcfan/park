// Each park's real photos and videos, in gallery order. Written by the curate
// tool's export (curate/); safe to edit by hand once that tool is gone.
// A park with no entry here shows its placeholder grid from parks.ts.
import type { PhotoSlot } from "./parks";

export const media: Record<string, PhotoSlot[]> = {
  yellowstone: [
    { type: "image", orientation: "portrait", caption: "Liberty Cap at Mammoth Hot Springs", src: "/media/yellowstone/img-0845.webp" },
    { type: "video", orientation: "landscape", caption: "Elk on the lawns at Mammoth", src: "/media/yellowstone/img-0842.mp4", poster: "/media/yellowstone/img-0842-poster.webp" },
    { type: "image", orientation: "landscape", caption: "Up on the Mammoth terraces", src: "/media/yellowstone/img-0865.webp" },
    { type: "video", orientation: "portrait", caption: "A raven keeping watch", src: "/media/yellowstone/img-0820.mp4", poster: "/media/yellowstone/img-0820-poster.webp" },
  ],
};
