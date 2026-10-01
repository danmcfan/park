import ChevronLeft from "lucide-solid/icons/chevron-left";
import ChevronRight from "lucide-solid/icons/chevron-right";
import X from "lucide-solid/icons/x";
import { Show, createEffect, createMemo } from "solid-js";
import { aspectOf, type PhotoSlot } from "../data/parks";
import { reducedMotion } from "./Media";

// Full-screen viewer for one park's media, built on a modal <dialog> so the
// browser handles focus trapping, Esc, and making the page behind it inert.
// `index` is the open item (null = closed); only items with `src` are shown.
export default function Lightbox(props: {
  items: PhotoSlot[];
  index: number | null;
  onIndex: (i: number | null) => void;
}) {
  let dialog!: HTMLDialogElement;
  let swipeX = 0;
  let swipeY = 0;

  const viewable = createMemo(() => props.items.flatMap((item, i) => (item.src ? [i] : [])));
  const position = () => viewable().indexOf(props.index ?? -1);
  const item = () => (props.index === null ? undefined : props.items[props.index]);

  const step = (delta: number) => {
    const list = viewable();
    props.onIndex(list[(position() + delta + list.length) % list.length]);
  };

  createEffect(() => {
    if (props.index === null) dialog.open && dialog.close();
    else if (!dialog.open) dialog.showModal();
  });

  return (
    <dialog
      ref={dialog}
      class="lightbox"
      aria-label="Photo viewer"
      onClose={() => props.onIndex(null)}
      // A click on the dialog itself (not its contents) is a backdrop click.
      onClick={(e) => e.target === dialog && dialog.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
      }}
      onPointerDown={(e) => {
        swipeX = e.clientX;
        swipeY = e.clientY;
      }}
      onPointerUp={(e) => {
        const dx = e.clientX - swipeX;
        if (e.pointerType === "touch" && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - swipeY))
          step(dx < 0 ? 1 : -1);
      }}
    >
      <Show when={item()} keyed>
        {(current) => (
          <figure class="lightbox-figure" style={{ "--aspect": `${aspectOf(current)}` }}>
            {current.type === "video" ? (
              <video
                class="lightbox-media"
                src={current.src}
                poster={current.poster}
                aria-label={current.caption ?? ""}
                autoplay={!reducedMotion}
                controls
                muted
                loop
                playsinline
              />
            ) : (
              <img class="lightbox-media" src={current.src} alt={current.caption ?? ""} />
            )}
            <figcaption>
              <span>{current.caption}</span>
              <Show when={viewable().length > 1}>
                <span class="lightbox-count">
                  {position() + 1} / {viewable().length}
                </span>
              </Show>
            </figcaption>
          </figure>
        )}
      </Show>

      <button class="lightbox-close" aria-label="Close" onClick={() => dialog.close()}>
        <X aria-hidden="true" />
      </button>
      <Show when={viewable().length > 1}>
        <button class="lightbox-nav lightbox-prev" aria-label="Previous" onClick={() => step(-1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <button class="lightbox-nav lightbox-next" aria-label="Next" onClick={() => step(1)}>
          <ChevronRight aria-hidden="true" />
        </button>
      </Show>
    </dialog>
  );
}
