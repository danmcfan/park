import Camera from "lucide-solid/icons/camera";
import { Match, Switch, onCleanup, onMount } from "solid-js";
import { FULL_PX, SMALL_PX, srcsetOf, type PhotoSlot } from "../data/parks";
import { reducedMotion } from "../lib/motion";

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
// `src` is set yet. Always fills its container; the gallery sets the size and
// says how wide that is (`sizes`), so phones fetch the small photo file.
export default function Media(props: { item: PhotoSlot; sizes: string }) {
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
        {(src) => (
          <img
            class="media"
            srcset={srcsetOf(props.item, [SMALL_PX, FULL_PX])}
            sizes={props.sizes}
            src={src()}
            alt={label()}
            loading="lazy"
            decoding="async"
          />
        )}
      </Match>
    </Switch>
  );
}
