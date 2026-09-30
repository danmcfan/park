import { Show } from "solid-js";

// Renders a real image when `photo.src` is set, otherwise a tinted
// placeholder at the same aspect ratio so layout is final either way.
export default function Photo(props) {
  return (
    <div class={`photo-frame shape-${props.photo.shape} ${props.class ?? ""}`}>
      <Show
        when={props.photo.src}
        fallback={
          <div class="photo-placeholder" role="img" aria-label={props.photo.caption ?? "Photo coming soon"}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h3l2-3h6l2 3h3v12H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </div>
        }
      >
        <img src={props.photo.src} alt={props.photo.caption ?? ""} loading={props.eager ? "eager" : "lazy"} decoding="async" />
      </Show>
    </div>
  );
}
