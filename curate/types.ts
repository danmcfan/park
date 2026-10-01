// Shared between the curate server and its page.

// What the scan learns about a file in the dump.
export interface Scanned {
  id: string;
  path: string; // relative to the dump folder
  type: "image" | "video";
  taken?: string; // capture time, local, ISO-like; used for ordering
  lat?: number;
  lon?: number;
  width?: number; // as displayed (rotation applied)
  height?: number;
  duration?: number; // videos, seconds
  live?: boolean; // the motion half of a Live Photo
  suggestedPark?: string; // nearest park by GPS
}

// The choices you make in the page, saved in raw/curate.json.
export interface Choice {
  include?: boolean;
  park?: string;
  caption?: string;
  // Videos: clip range and poster frame, in seconds of the original.
  start?: number;
  end?: number;
  poster?: number;
}

export type Item = Scanned & Choice;
