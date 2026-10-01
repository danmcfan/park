import { describe, expect, it } from "vitest";
import { parks } from "../data/parks";
import { states } from "../data/states";
import { contains, shapeOf } from "./geo";

describe("shapeOf", () => {
  it("keeps Wyoming's true proportions (7° of longitude at ~43°N by 4° of latitude)", () => {
    const s = shapeOf(states.Wyoming.outline);
    expect(s.height).toBeCloseTo(4);
    expect(s.width).toBeCloseTo(7 * Math.cos((43 * Math.PI) / 180));
  });

  it("puts north at the top and west at the left", () => {
    const s = shapeOf(states.Utah.outline);
    expect(s.project([-114.05, 42])).toEqual([0, 0]);
    const [x, y] = s.project([-109.05, 37]);
    expect(x).toBeCloseTo(s.width);
    expect(y).toBeCloseTo(s.height);
  });

  it("leaves Utah's northeast notch outside the outline", () => {
    const s = shapeOf(states.Utah.outline);
    expect(contains(s.points, s.project([-110, 41.5]))).toBe(false);
    expect(contains(s.points, s.project([-112, 41.5]))).toBe(true);
  });
});

describe("park pins", () => {
  it("has an outline for every park's state, with the park and the label inside it", () => {
    for (const p of parks) {
      const state = states[p.state];
      expect(state, p.state).toBeDefined();
      const s = shapeOf(state.outline);
      expect(contains(s.points, s.project([p.location.lon, p.location.lat])), p.slug).toBe(true);
      expect(contains(s.points, s.project(state.label)), p.state).toBe(true);
    }
  });
});
