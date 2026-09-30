import { For, Switch, Match } from "solid-js";
import Icon from "./Icon";
import Photo from "./Photo";

// Deterministic jitter so the pile looks hand-placed but is stable.
const jitter = (i, salt) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

function Decor(props) {
  const d = props.d;
  return (
    <div
      class={`deco deco-${d.type} deco-${d.side}`}
      data-speed={d.speed}
      style={{ top: `${d.top}%`, "--r": `${jitter(props.i, 7) * 16}deg`, "--note": d.color }}
    >
      <Switch>
        <Match when={d.type === "badge"}>
          <div class="patch">
            <span class="patch-sub">{d.sub}</span>
            <span class="patch-title">{d.title}</span>
          </div>
        </Match>
        <Match when={d.type === "note"}>
          <p class="postit">{d.text}</p>
        </Match>
        <Match when={d.type === "magnet"}>
          <span class="enamel">
            <Icon name={d.icon} />
          </span>
        </Match>
        <Match when={d.type === "sticker"}>
          <span class="sticker">
            <Icon name={d.icon} />
            {d.text}
          </span>
        </Match>
        <Match when={d.type === "ticket"}>
          <div class="ticket">
            <span class="ticket-title">{d.text}</span>
            <span class="ticket-sub">{d.sub}</span>
          </div>
        </Match>
      </Switch>
    </div>
  );
}

export default function Wall(props) {
  const p = props.park;
  return (
    <section
      id={p.slug}
      class="park wall"
      data-index={props.index}
      style={{ "--accent": p.theme.accent, "--deep": p.theme.deep, "--soft": p.theme.soft }}
    >
      <div class="wall-bg" style={{ "background-image": `url(${p.backdrop})` }} />

      <div class="wall-decor" aria-hidden="true">
        <For each={p.decor}>{(d, i) => <Decor d={d} i={i()} />}</For>
      </div>

      <header class="wall-head">
        <span>National Park · {p.state}</span>
        <h2>{p.name}</h2>
        <span>{p.dates}</span>
      </header>

      <div class="strip">
        <div class="snaps">
          <For each={p.photos}>
            {(photo, i) => (
              <figure
                class={`snap snap-${photo.shape}`}
                style={{
                  "--tilt": `${jitter(i(), props.index) * 7}deg`,
                  "--dx": `${jitter(i(), 3) * 24}px`,
                  "z-index": 1 + Math.floor((jitter(i(), 11) + 0.5) * 5),
                }}
                tabindex="0"
                onClick={() => props.onOpen(photo, p)}
                onKeyDown={(e) => e.key === "Enter" && props.onOpen(photo, p)}
              >
                <div class="snap-film">
                  <Photo photo={photo} />
                </div>
                <figcaption>{photo.caption}</figcaption>
              </figure>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}
