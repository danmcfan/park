import type { LonLat } from "../data/states";

export interface StateShape {
  // Size in projected units (degrees of latitude); x grows east, y grows south.
  width: number;
  height: number;
  points: [x: number, y: number][];
  project: (p: LonLat) => [x: number, y: number];
}

// Equirectangular projection centered on the state: a degree of longitude is
// shortened by cos(latitude) so the outline keeps its true proportions.
export function shapeOf(ring: LonLat[]): StateShape {
  const lons = ring.map((p) => p[0]);
  const lats = ring.map((p) => p[1]);
  const west = Math.min(...lons);
  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const k = Math.cos((((north + south) / 2) * Math.PI) / 180);
  const project = ([lon, lat]: LonLat): [number, number] => [(lon - west) * k, north - lat];
  return {
    width: (Math.max(...lons) - west) * k,
    height: north - south,
    points: ring.map(project),
    project,
  };
}

// Is a projected point inside the polygon? (Ray casting.)
export function contains(points: [number, number][], [x, y]: [number, number]) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
