import { Match, Switch } from "solid-js";
import type { PhotoSlot } from "../data/parks";

// Renders an image, a muted looping video, or a tinted placeholder when no
// `src` is set yet. Always fills its container; the gallery sets the size.
export default function Media(props: { item: PhotoSlot }) {
  const label = () => props.item.caption ?? "";

  return (
    <Switch
      fallback={
        <div class="media media-placeholder" role="img" aria-label={label() || "Photo coming soon"}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h3l2-3h6l2 3h3v12H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </div>
      }
    >
      <Match when={props.item.src && props.item.type === "video"}>
        <video
          class="media"
          src={props.item.src}
          poster={props.item.poster}
          aria-label={label()}
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
        />
      </Match>
      <Match when={props.item.src}>
        <img class="media" src={props.item.src} alt={label()} loading="lazy" decoding="async" />
      </Match>
    </Switch>
  );
}
