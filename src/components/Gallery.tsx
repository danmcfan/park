import { For } from "solid-js";
import type { PhotoSlot } from "../data/parks";
import Media from "./Media";

type Fix = "widen" | "shorten";
type Span = { w: number; h: number };

const spanOf = (item: PhotoSlot, fix?: Fix): Span => {
  if (fix === "widen") return { w: 2, h: 1 };
  if (fix === "shorten") return { w: 1, h: 1 };
  return { w: item.shape === "wide" ? 2 : 1, h: item.shape === "tall" ? 2 : 1 };
};

// Empty cells left by CSS `grid-auto-flow: dense` packing at `cols` columns.
function holes(spans: Span[], cols: number): number {
  const taken: boolean[][] = [];
  const free = (r: number, c: number, s: Span) => {
    for (let y = r; y < r + s.h; y++)
      for (let x = c; x < c + s.w; x++) if (taken[y]?.[x]) return false;
    return true;
  };
  let used = 0;
  for (const s of spans) {
    const w = Math.min(s.w, cols);
    placing: for (let r = 0; ; r++)
      for (let c = 0; c + w <= cols; c++)
        if (free(r, c, { w, h: s.h })) {
          for (let y = r; y < r + s.h; y++)
            for (let x = c; x < c + w; x++) (taken[y] ??= [])[x] = true;
          used += w * s.h;
          break placing;
        }
  }
  return taken.length * cols - used;
}

// Greedily widen squares or shorten talls, preferring items near the end,
// until the grid packs with no empty cells at `cols` columns.
function fixesFor(items: PhotoSlot[], cols: number): Map<number, Fix> {
  const fixes = new Map<number, Fix>();
  const score = () => holes(items.map((item, i) => spanOf(item, fixes.get(i))), cols);
  let best = score();
  while (best > 0) {
    let pick: [number, Fix] | undefined;
    for (let i = items.length - 1; i >= 0; i--) {
      if (fixes.has(i) || items[i].shape === "wide") continue;
      const fix: Fix = items[i].shape === "square" ? "widen" : "shorten";
      fixes.set(i, fix);
      const n = score();
      fixes.delete(i);
      if (n < best) [best, pick] = [n, [i, fix]];
    }
    if (!pick) break;
    fixes.set(...pick);
  }
  return fixes;
}

// Aligned collage: a uniform grid where "wide" items span two columns and
// "tall" items span two rows. A few tiles are resized so every grid comes
// out as a full rectangle at both the desktop (3) and phone (2) column counts.
export default function Gallery(props: { items: PhotoSlot[] }) {
  const fix3 = () => fixesFor(props.items, 3);
  const fix2 = () => fixesFor(props.items, 2);

  return (
    <div class="gallery">
      <For each={props.items}>
        {(item, i) => {
          const f3 = () => fix3().get(i());
          const f2 = () => fix2().get(i());
          return (
            <figure
              class={`tile tile-${item.shape}`}
              classList={{
                "widen-3": f3() === "widen",
                "shorten-3": f3() === "shorten",
                "widen-2": f2() === "widen",
                "shorten-2": f2() === "shorten",
              }}
            >
              <Media item={item} />
            </figure>
          );
        }}
      </For>
    </div>
  );
}
