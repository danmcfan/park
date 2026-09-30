import { For } from "solid-js";
import Icon from "./Icon";
import Photo from "./Photo";

// Small deterministic tilt so prints look hand-placed but stay stable.
const tilt = (i, seed) => {
  const x = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return ((x - Math.floor(x)) - 0.5) * 3.2;
};

export default function Board(props) {
  const p = props.park;
  return (
    <section
      id={p.slug}
      class="park"
      data-index={props.index}
      style={{
        "--accent": p.theme.accent,
        "--deep": p.theme.deep,
        "--soft": p.theme.soft,
        "--board": p.theme.board,
      }}
    >
      <header class="band">
        <h2 class="band-title reveal">{p.name}</h2>
        <div class="band-meta">
          <span>National Park</span>
          <span>{p.state} · {p.dates}</span>
        </div>
      </header>

      <figure class="park-hero">
        <div class="park-hero-media">
          <Photo photo={p.hero} eager />
        </div>
        <figcaption>{p.hero.caption}</figcaption>
      </figure>

      <div class="park-intro">
        <p class="journal reveal">{p.journal}</p>
        <dl class="facts reveal">
          <For each={p.facts}>
            {(f) => (
              <div>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            )}
          </For>
        </dl>
      </div>

      <div class="board">
        <div class="board-head">
          <span class="board-tag">
            {p.name} <em>{p.photos.length} photos</em>
          </span>
          <div class="board-pins">
            <For each={p.icons}>
              {(name) => (
                <span class="enamel">
                  <Icon name={name} />
                </span>
              )}
            </For>
          </div>
        </div>

        <div class="board-grid">
          <For each={p.photos}>
            {(photo, i) => (
              <figure
                class={`print print-${photo.shape}`}
                style={{ "--tilt": `${tilt(i(), props.index)}deg` }}
                tabindex="0"
                onClick={() => props.onOpen(photo, p)}
                onKeyDown={(e) => e.key === "Enter" && props.onOpen(photo, p)}
              >
                {i() % 3 === 0 ? (
                  <span class="magnet magnet-icon">
                    <Icon name={p.icons[(i() / 3) % p.icons.length]} />
                  </span>
                ) : (
                  <span class="magnet" />
                )}
                <Photo photo={photo} />
                {photo.caption && <figcaption>{photo.caption}</figcaption>}
              </figure>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}
