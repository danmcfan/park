import Camera from "lucide-solid/icons/camera";
import { Match, Switch, onCleanup, onMount } from "solid-js";
import type { PhotoSlot } from "../data/parks";

export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Muted loop that plays only while on screen, rather than trusting each
// browser's autoplay rules. With reduced motion it waits for the user instead.
function LoopVideo(props: { item: PhotoSlot }) {
  let el!: HTMLVideoElement;

  onMount(() => {
    if (reducedMotion) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    onCleanup(() => io.disconnect());
  });

  return (
    <video
      ref={el}
      class="media"
      src={props.item.src}
      poster={props.item.poster}
      aria-label={props.item.caption ?? ""}
      controls={reducedMotion}
      muted
      loop
      playsinline
      preload={reducedMotion ? "none" : "metadata"}
    />
  );
}

// Renders an image, a muted looping video, or a tinted placeholder when no
// `src` is set yet. Always fills its container; the gallery sets the size.
export default function Media(props: { item: PhotoSlot }) {
  const label = () => props.item.caption ?? "";

  return (
    <Switch
      fallback={
        <div class="media media-placeholder" role="img" aria-label={label() || "Photo coming soon"}>
          <Camera aria-hidden="true" />
        </div>
      }
    >
      <Match when={props.item.src && props.item.type === "video"}>
        <LoopVideo item={props.item} />
      </Match>
      <Match when={props.item.src}>
        <img class="media" src={props.item.src} alt={label()} loading="lazy" decoding="async" />
      </Match>
    </Switch>
  );
}
