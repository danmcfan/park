import { For, createMemo } from "solid-js";
import { parks } from "../data/parks";

const pts = parks.map((p) => p.map);
const segLens = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
const total = segLens.reduce((a, b) => a + b, 0);
const pathD = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");

// progress: 0..parks.length-1; integer = at a park, fraction = driving between.
function pointAt(progress: number) {
  const i = Math.min(Math.floor(progress), pts.length - 2);
  const t = Math.max(0, Math.min(1, progress - i));
  const a = pts[i], b = pts[i + 1];
  const traveled = segLens.slice(0, i).reduce((s, l) => s + l, 0) + segLens[i] * t;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, traveled };
}

export default function RouteMap(props: { progress?: number; active?: number; large?: boolean; onSelect?: (i: number) => void }) {
  const van = createMemo(() => pointAt(props.progress ?? 0));

  return (
    <svg class={`route-map ${props.large ? "large" : ""}`} viewBox="-10 0 220 300" aria-label="Trip route map">
      {/* Simplified Utah / Wyoming outlines */}
      <path class="state" d="M20 170 H85 V150 H130 V295 H20 Z" />
      <path class="state" d="M110 20 H195 V140 H110 Z" />
      <text class="state-label" x="75" y="285" text-anchor="middle">Utah</text>
      <text class="state-label" x="152" y="130" text-anchor="middle">Wyoming</text>

      <path class="route-bg" d={pathD} />
      <path class="route-done" d={pathD} style={{ "stroke-dasharray": `${van().traveled} ${total}` }} />

      <For each={parks}>
        {(p, i) => {
          const left = p.map.x > 120;
          return (
            <g
              class="stop"
              classList={{ active: props.active === i(), visited: (props.progress ?? 0) >= i() - 0.01 }}
              transform={`translate(${p.map.x} ${p.map.y})`}
              style={{ "--accent": p.theme.accent }}
              onClick={() => props.onSelect?.(i())}
              tabindex={props.onSelect ? "0" : "-1"}
              role="link"
              aria-label={`Go to ${p.name}`}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && props.onSelect?.(i())}
            >
              <circle class="hit" r="12" />
              <circle class="dot" r="4.5" />
              <text x={left ? -9 : 9} y="3.5" text-anchor={left ? "end" : "start"}>{p.name}</text>
            </g>
          );
        }}
      </For>

      <g class="van" transform={`translate(${van().x} ${van().y})`}>
        <circle r="7" class="van-halo" />
        <circle r="3.5" class="van-dot" />
      </g>
    </svg>
  );
}
