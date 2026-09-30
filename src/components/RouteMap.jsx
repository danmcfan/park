import { For, createMemo } from "solid-js";
import { parks } from "../data/parks";

const pts = parks.map((p) => p.map);
const segLens = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
const total = segLens.reduce((a, b) => a + b, 0);
const pathD = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");

// progress: 0..parks.length-1; integer = at a park, fraction = driving between.
function pointAt(progress) {
  const i = Math.min(Math.floor(progress), pts.length - 2);
  const t = Math.max(0, Math.min(1, progress - i));
  const a = pts[i], b = pts[i + 1];
  const traveled = segLens.slice(0, i).reduce((s, l) => s + l, 0) + segLens[i] * t;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, traveled };
}

export default function RouteMap(props) {
  const van = createMemo(() => pointAt(props.progress ?? 0));

  return (
    <svg class={`route-map ${props.large ? "large" : ""}`} viewBox="0 0 200 300" role="navigation" aria-label="Trip route">
      {/* Rough state outlines for flavor: Utah / Wyoming */}
      <path class="state" d="M20 170 H85 V150 H130 V295 H20 Z" />
      <path class="state" d="M110 20 H195 V140 H110 Z" />
      <text class="state-label" x="30" y="288">UTAH</text>
      <text class="state-label" x="150" y="134">WYOMING</text>

      <path class="route-bg" d={pathD} />
      <path
        class="route-done"
        d={pathD}
        style={{ "stroke-dasharray": `${van().traveled} ${total}` }}
      />

      <For each={parks}>
        {(p, i) => (
          <g
            class="stop"
            classList={{ active: props.active === i(), visited: (props.progress ?? 0) >= i() }}
            transform={`translate(${p.map.x} ${p.map.y})`}
            onClick={() => props.onSelect?.(i())}
            tabindex="0"
            role="link"
            aria-label={`Go to ${p.name}`}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && props.onSelect?.(i())}
          >
            <circle r="7" style={{ fill: p.theme.board }} />
            <text x={i() % 2 ? -11 : 11} y="4" text-anchor={i() % 2 ? "end" : "start"}>{p.name}</text>
          </g>
        )}
      </For>

      <g class="van" transform={`translate(${van().x} ${van().y})`}>
        <rect x="-6" y="-4" width="12" height="7" rx="2" />
        <circle cx="-3" cy="3.5" r="1.6" />
        <circle cx="3" cy="3.5" r="1.6" />
      </g>
    </svg>
  );
}
