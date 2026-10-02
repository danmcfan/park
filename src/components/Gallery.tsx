import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { aspectOf, type PhotoSlot } from "../data/parks";
import { partition, printStyle, rowCountFor } from "../lib/justify";
import Lightbox from "./Lightbox";
import Media from "./Media";

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
    // Applied on the next frame: a new row count changes the gallery's own
    // height, and changing it inside the callback is a ResizeObserver loop
    // error. (WebKit can mount before the stylesheet applies, so the first
    // width read above may be off and corrected here.)
    let frame = 0;
    const ro = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(entry.contentRect.width));
    });
    ro.observe(el);
    onCleanup(() => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    });
  });

  const aspects = createMemo(() => props.items.map(aspectOf));
  // Row count is its own memo so small width changes don't rebuild the rows
  // (which would recreate tiles and restart videos); only a new count does.
  const rowCount = createMemo(() => rowCountFor(aspects(), width() || window.innerWidth));
  const rows = createMemo(() => partition(aspects(), rowCount()));

  return (
    <div class="gallery" ref={el}>
      <For each={rows()}>
        {(row) => (
          <div class="gallery-row">
            <For each={row}>
              {(i) => {
                const item = props.items[i];
                const aspect = aspectOf(item);
                const print = printStyle(item.src ?? item.caption ?? String(i), i);
                // Grow is scaled up because flex-grow values summing to <1 leave
                // free space unfilled (a lone portrait photo is only 0.75).
                return (
                  <figure
                    class={`tile tape-${print.tape}`}
                    style={{
                      flex: `${aspect * 100} 1 0`,
                      "aspect-ratio": `${aspect}`,
                      "--tilt": `${print.tilt.toFixed(2)}deg`,
                    }}
                  >
                    <div class="tile-photo">
                      <Media item={item} />
                    </div>
                    <span class="tape" aria-hidden="true" />
                    <span class="tape" aria-hidden="true" />
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
