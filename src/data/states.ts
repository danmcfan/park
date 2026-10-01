// State outlines as [lon, lat] rings, traced from their surveyed boundaries.
// Utah and Wyoming are (almost) straight lines of longitude and latitude, so a
// handful of corners is exact enough at badge size.
export type LonLat = [lon: number, lat: number];

export interface State {
  outline: LonLat[];
  // Where the name sits: the middle of the state's widest block.
  label: LonLat;
}

export const states: Record<string, State> = {
  Utah: {
    label: [-111.55, 39.7],
    outline: [
      [-114.05, 42.0],
      [-111.05, 42.0],
      [-111.05, 41.0],
      [-109.05, 41.0],
      [-109.05, 37.0],
      [-114.05, 37.0],
    ],
  },
  Wyoming: {
    label: [-107.55, 43.0],
    outline: [
      [-111.05, 45.0],
      [-104.05, 45.0],
      [-104.05, 41.0],
      [-111.05, 41.0],
    ],
  },
};
