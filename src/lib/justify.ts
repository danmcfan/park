// Layout math for the justified gallery, kept free of the DOM so it can be
// unit tested.

// Target row height by container width; actual rows land near it.
export const targetRowHeight = (width: number) => (width < 640 ? 220 : 320);

// How many rows a gallery of `aspects` should use at `width` pixels.
export const rowCountFor = (aspects: number[], width: number) => {
  const total = aspects.reduce((s, a) => s + a, 0);
  return Math.max(1, Math.round((total * targetRowHeight(width)) / width));
};

// Split `aspects` into `k` contiguous rows whose total aspect ratios are as
// even as possible (linear partition), so every row comes out a similar height.
export function partition(aspects: number[], k: number): number[][] {
  const n = aspects.length;
  if (k >= n) return aspects.map((_, i) => [i]);
  const prefix = [0];
  for (const a of aspects) prefix.push(prefix[prefix.length - 1] + a);
  const ideal = prefix[n] / k;
  const cost = (i: number, j: number) => (prefix[j] - prefix[i] - ideal) ** 2;

  // best[r][j]: lowest cost of putting the first j items in r rows.
  const best = Array.from({ length: k + 1 }, () => new Array<number>(n + 1).fill(Infinity));
  const cut = Array.from({ length: k + 1 }, () => new Array<number>(n + 1).fill(0));
  best[0][0] = 0;
  for (let r = 1; r <= k; r++)
    for (let j = r; j <= n; j++)
      for (let i = r - 1; i < j; i++) {
        const c = best[r - 1][i] + cost(i, j);
        if (c < best[r][j]) [best[r][j], cut[r][j]] = [c, i];
      }

  const rows: number[][] = [];
  for (let r = k, j = n; r > 0; j = cut[r][j], r--)
    rows.unshift(Array.from({ length: j - cut[r][j] }, (_, x) => cut[r][j] + x));
  return rows;
}

// Stable small tilt and tape style for a print, derived from a string key
// (its media path or caption) so a print looks the same on every render and
// screen size. Tilt is 0.4–1.4° and alternates direction with `index`.
export type Tape = "top" | "corners" | "diagonal";
const TAPES: Tape[] = ["top", "corners", "diagonal"];

export function printStyle(key: string, index: number): { tilt: number; tape: Tape } {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  h >>>= 0;
  const magnitude = 0.4 + (h % 1000) / 1000;
  return { tilt: (index % 2 ? 1 : -1) * magnitude, tape: TAPES[(h >>> 10) % TAPES.length] };
}
