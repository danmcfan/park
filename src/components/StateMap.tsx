import { createSignal, onCleanup, onMount } from "solid-js";
import type { Park } from "../data/parks";
import { states } from "../data/states";
import { shapeOf } from "../lib/geo";

// The park's state cut from cork board at true proportions, named inside,
// sitting a few millimetres proud of the page, with a ball-head map pin pushed
// in where the park is. Sized in CSS by --map-unit (px per degree of latitude).
const UNIT = 20; // viewBox units per degree
const DEPTH = 6; // board thickness, in viewBox units

export default function StateMap(props: { park: Park }) {
  const state = states[props.park.state];
  const shape = shapeOf(state.outline);
  const [lx, ly] = shape.project(state.label);
  const [px, py] = shape.project([props.park.location.lon, props.park.location.lat]);
  const path = `M${shape.points.map(([x, y]) => `${x * UNIT},${y * UNIT}`).join("L")}Z`;
  // Filter and gradient ids are per park: four maps share one document.
  const id = (name: string) => `${props.park.slug}-${name}`;
  const ref = (name: string) => `url(#${id(name)})`;

  // The pin drops in the first time the map is well into view (CSS skips the
  // drop for reduced motion and just shows the pin).
  let figure!: HTMLElement;
  const [pinned, setPinned] = createSignal(false);
  onMount(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPinned(true);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(figure);
    onCleanup(() => io.disconnect());
  });

  return (
    <figure
      ref={figure}
      class="state-map"
      classList={{ pinned: pinned() }}
      role="img"
      aria-label={`${props.park.name} on a map of ${props.park.state}`}
      style={{ "--w": shape.width, "--h": shape.height }}
    >
      <svg viewBox={`0 0 ${shape.width * UNIT} ${shape.height * UNIT}`} aria-hidden="true">
        <defs>
          {/* Cork: the board's color with dark and light granules scattered on it. */}
          <filter id={id("cork")} color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="7" result="n1" />
            <feColorMatrix in="n1" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 6 0 0 0 -3.1" result="a1" />
            <feFlood class="cork-dark" />
            <feComposite in2="a1" operator="in" result="dark" />
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="23" result="n2" />
            <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 6 0 0 -3.2" result="a2" />
            <feFlood class="cork-light" />
            <feComposite in2="a2" operator="in" result="light" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="dark" />
              <feMergeNode in="light" />
            </feMerge>
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          {/* Light from the top left: the face brightens there and dims away from it. */}
          <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity=".22" />
            <stop offset=".5" stop-color="#fff" stop-opacity="0" />
            <stop offset="1" stop-color="#000" stop-opacity=".12" />
          </linearGradient>
          {/* The face's cut rim: catches the light at the top left, falls into shade at the bottom right. */}
          <linearGradient id={id("rim")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity=".45" />
            <stop offset=".5" stop-color="#fff" stop-opacity="0" />
            <stop offset="1" stop-color="#000" stop-opacity=".3" />
          </linearGradient>
        </defs>
        {/* The cut edge: the outline stacked down and a little right, away from the light. */}
        <g class="cork-side" filter={ref("cork")}>
          {Array.from({ length: DEPTH }, (_, i) => (
            <path d={path} transform={`translate(${(DEPTH - i) * 0.4} ${DEPTH - i})`} />
          ))}
        </g>
        <path class="state-shape" d={path} filter={ref("cork")} />
        <path class="cork-sheen" d={path} fill={ref("sheen")} stroke={ref("rim")} />
        <text class="state-name" x={lx * UNIT} y={ly * UNIT}>
          {props.park.state}
        </text>
      </svg>
      {/* Centered on the hole the needle went in; the rest leans up and left. */}
      <span
        class="state-pin"
        style={{ left: `${(px / shape.width) * 100}%`, top: `${(py / shape.height) * 100}%` }}
      >
        <span class="pin-shadow" />
        <span class="pin-body">
          <span class="pin-needle" />
          <span class="pin-head" />
        </span>
      </span>
    </figure>
  );
}
