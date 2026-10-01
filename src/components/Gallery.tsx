import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { aspectOf, type PhotoSlot } from "../data/parks";
import Lightbox from "./Lightbox";
import Media from "./Media";

const GAP = 8;

// Target row height by container width; actual rows land near it.
const targetRowHeight = (width: number) => (width < 640 ? 220 : 320);

// Split `aspects` into `k` contiguous rows whose total aspect ratios are as
// even as possible (linear partition), so every row comes out a similar height.
function partition(aspects: number[], k: number): number[][] {
  const n = aspects.length;
  if (k >= n) return aspects.map((_, i) => [i]);
  const prefix = [0];
  for (const a of aspects) prefix.push(prefix[prefix.length - 1] + a);
  const ideal = prefix[n] / k;
  const cost = (i: number, j: number) => (prefix[j] - prefix[i] - ideal) ** 2;

  // best[r][j]: lowest cost of putting the first j items in r rows.
  const best = Array.from({ length: k + 1 }, () => new Array<number>(n + 1).fill(Infinity));
  const cut = Array.from({ length: k + 1 }, () => new Array<number>(n + 1).fill(0));
  best[0][0] = 0;
  for (let r = 1; r <= k; r++)
    for (let j = r; j <= n; j++)
      for (let i = r - 1; i < j; i++) {
        const c = best[r - 1][i] + cost(i, j);
        if (c < best[r][j]) [best[r][j], cut[r][j]] = [c, i];
      }

  const rows: number[][] = [];
  for (let r = k, j = n; r > 0; j = cut[r][j], r--)
    rows.unshift(Array.from({ length: j - cut[r][j] }, (_, x) => cut[r][j] + x));
  return rows;
}

// Justified collage: items keep their true aspect ratio (no cropping) and
// every row, including the last, spans the full width.
export default function Gallery(props: { items: PhotoSlot[] }) {
  let el!: HTMLDivElement;
  const [width, setWidth] = createSignal(0);
  const [open, setOpen] = createSignal<number | null>(null);
  // Tile that opened the lightbox. Safari doesn't focus buttons on click, so
  // focus is handed back explicitly on close rather than left to <dialog>.
  let opener: HTMLElement | undefined;
  const setIndex = (i: number | null) => {
    setOpen(i);
    if (i === null) opener?.focus({ preventScroll: true });
  };

  onMount(() => {
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    onCleanup(() => ro.disconnect());
  });

  const aspects = createMemo(() => props.items.map(aspectOf));
  // Row count is its own memo so small width changes don't rebuild the rows
  // (which would recreate tiles and restart videos); only a new count does.
  const rowCount = createMemo(() => {
    const w = width() || window.innerWidth;
    const total = aspects().reduce((s, a) => s + a, 0);
    return Math.max(1, Math.round((total * targetRowHeight(w)) / w));
  });
  const rows = createMemo(() => partition(aspects(), rowCount()));

  return (
    <div class="gallery" ref={el} style={{ "--gap": `${GAP}px` }}>
      <For each={rows()}>
        {(row) => (
          <div class="gallery-row">
            <For each={row}>
              {(i) => {
                const item = props.items[i];
                const aspect = aspectOf(item);
                // Grow is scaled up because flex-grow values summing to <1 leave
                // free space unfilled (a lone portrait photo is only 0.75).
                return (
                  <figure class="tile" style={{ flex: `${aspect * 100} 1 0`, "aspect-ratio": `${aspect}` }}>
                    <Media item={item} />
                    {item.src && (
                      <button
                        class="tile-open"
                        aria-label={`View ${item.caption ?? (item.type === "video" ? "video" : "photo")} full screen`}
                        onClick={(e) => {
                          opener = e.currentTarget;
                          setOpen(i);
                        }}
                      />
                    )}
                  </figure>
                );
              }}
            </For>
          </div>
        )}
      </For>
      <Lightbox items={props.items} index={open()} onIndex={setIndex} />
    </div>
  );
}
