import { describe, expect, it } from "vitest";
import { partition, rowCountFor, targetRowHeight } from "./justify";

const PHOTO_L = 4 / 3;
const PHOTO_P = 3 / 4;
const VIDEO_L = 16 / 9;
const VIDEO_P = 9 / 16;

const sums = (aspects: number[], rows: number[][]) => rows.map((r) => r.reduce((s, i) => s + aspects[i], 0));

describe("partition", () => {
  it("keeps every item exactly once, in order", () => {
    const aspects = [PHOTO_P, VIDEO_L, PHOTO_L, VIDEO_P, PHOTO_L, PHOTO_P, PHOTO_L, PHOTO_L, PHOTO_P];
    for (let k = 1; k <= aspects.length; k++) {
      const rows = partition(aspects, k);
      expect(rows.flat()).toEqual(aspects.map((_, i) => i));
      expect(rows.every((r) => r.length > 0)).toBe(true);
    }
  });

  it("returns exactly k rows when there are enough items", () => {
    const aspects = Array(7).fill(PHOTO_L);
    expect(partition(aspects, 3)).toHaveLength(3);
  });

  it("gives each item its own row when k >= n", () => {
    expect(partition([PHOTO_L, PHOTO_P], 5)).toEqual([[0], [1]]);
  });

  it("splits equal items evenly", () => {
    expect(partition(Array(6).fill(PHOTO_L), 2)).toEqual([
      [0, 1, 2],
      [3, 4, 5],
    ]);
  });

  it("balances rows by total aspect, not item count", () => {
    // Two wide items then four narrow ones: the best split by aspect is 2 + 4.
    const aspects = [VIDEO_L, VIDEO_L, VIDEO_P, VIDEO_P, VIDEO_P, VIDEO_P];
    expect(partition(aspects, 2)).toEqual([
      [0, 1],
      [2, 3, 4, 5],
    ]);
  });

  it("finds the most even 3-row split of a mixed gallery", () => {
    const aspects = [PHOTO_P, VIDEO_L, PHOTO_L, VIDEO_P, PHOTO_L, PHOTO_P, PHOTO_L, PHOTO_L, PHOTO_P];
    const spread = (rows: number[][]) => {
      const s = sums(aspects, rows);
      const mean = s.reduce((a, b) => a + b, 0) / s.length;
      return s.reduce((acc, x) => acc + (x - mean) ** 2, 0);
    };
    // Brute force every pair of cut points.
    let best = Infinity;
    for (let i = 1; i < aspects.length - 1; i++)
      for (let j = i + 1; j < aspects.length; j++) {
        const idx = aspects.map((_, x) => x);
        best = Math.min(best, spread([idx.slice(0, i), idx.slice(i, j), idx.slice(j)]));
      }
    expect(spread(partition(aspects, 3))).toBeCloseTo(best);
  });
});

describe("rowCountFor", () => {
  it("is at least one row", () => {
    expect(rowCountFor([PHOTO_P], 1200)).toBe(1);
    expect(rowCountFor([], 1200)).toBe(1);
  });

  it("lands rows near the target height", () => {
    const aspects = Array(12).fill(PHOTO_L);
    for (const width of [375, 800, 1200]) {
      const k = rowCountFor(aspects, width);
      const perRow = aspects.length / k;
      const height = width / (perRow * PHOTO_L);
      expect(height / targetRowHeight(width)).toBeGreaterThan(0.6);
      expect(height / targetRowHeight(width)).toBeLessThan(1.6);
    }
  });

  it("uses more rows on narrower screens", () => {
    const aspects = Array(9).fill(PHOTO_L);
    expect(rowCountFor(aspects, 375)).toBeGreaterThan(rowCountFor(aspects, 1200));
  });
});
