import type { Park } from "../data/parks";
import { states } from "../data/states";
import { shapeOf } from "../lib/geo";

// The park's state as a small stitched outline, named inside, with a dot where
// the park is. Drawn at true proportions; sized in CSS by --map-unit (px per
// degree of latitude).
const UNIT = 20; // viewBox units per degree

export default function StateMap(props: { park: Park }) {
  const state = states[props.park.state];
  const shape = shapeOf(state.outline);
  const [lx, ly] = shape.project(state.label);
  const [px, py] = shape.project([props.park.location.lon, props.park.location.lat]);
  const path = `M${shape.points.map(([x, y]) => `${x * UNIT},${y * UNIT}`).join("L")}Z`;

  return (
    <figure
      class="state-map"
      role="img"
      aria-label={`${props.park.name} on a map of ${props.park.state}`}
      style={{ "--w": shape.width, "--h": shape.height }}
    >
      <svg viewBox={`0 0 ${shape.width * UNIT} ${shape.height * UNIT}`} aria-hidden="true">
        <path class="state-shape" d={path} />
        <text class="state-name" x={lx * UNIT} y={ly * UNIT}>
          {props.park.state}
        </text>
      </svg>
      <span
        class="state-pin"
        style={{ left: `${(px / shape.width) * 100}%`, top: `${(py / shape.height) * 100}%` }}
      />
    </figure>
  );
}
