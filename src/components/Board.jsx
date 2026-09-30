import { For } from "solid-js";
import Icon from "./Icon";

// Deterministic pseudo-random so layout is stable between renders.
const rand = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
const fasteners = ["magnet", "pin", "tape", "magnet"];

export default function Board(props) {
  const p = props.park;
  return (
    <section
      id={p.slug}
      class="board"
      data-index={props.index}
      style={{
        "--board": p.theme.board,
        "--accent": p.theme.accent,
        "--ink": p.theme.ink,
        "--magnet": p.theme.magnet,
      }}
    >
      <div class="board-texture" />
      <header class="board-header">
        <div class="sign">
          <span class="sign-small">National Park</span>
          <h2>{p.name}</h2>
          <span class="sign-small">{p.dates}</span>
        </div>
        <div class="note pin-item" style={{ "--rot": "2deg" }}>
          <span class="fastener tape" />
          <p>{p.journal}</p>
        </div>
      </header>

      <div class="photo-grid">
        <For each={p.photos}>
          {(photo, i) => {
            const r = rand(i() + props.index * 100);
            const kind = fasteners[i() % fasteners.length];
            return (
              <figure
                class="photo pin-item"
                classList={{ portrait: photo.height > photo.width }}
                style={{ "--rot": `${(r - 0.5) * 8}deg` }}
                onClick={() => props.onOpen(photo)}
              >
                {kind === "magnet" ? (
                  <span class="fastener magnet">
                    <Icon name={p.icons[i() % p.icons.length]} />
                  </span>
                ) : (
                  <span class={`fastener ${kind}`} />
                )}
                <img src={photo.src} width={photo.width} height={photo.height} loading="lazy" alt={photo.caption ?? `${p.name} photo ${i() + 1}`} />
                {photo.caption && <figcaption>{photo.caption}</figcaption>}
              </figure>
            );
          }}
        </For>
      </div>

      <For each={p.icons}>
        {(name, i) => (
          <span class="sticker parallax-fast" style={{ top: `${15 + i() * 22}%`, [i() % 2 ? "right" : "left"]: "1.5%" }}>
            <Icon name={name} />
          </span>
        )}
      </For>
    </section>
  );
}
