import { describe, expect, it } from "vitest";
import { parks } from "../data/parks";
import { secret } from "../data/secret";
import { withSecret } from "./secret";

describe("secret print", () => {
  const park = parks.find((p) => p.slug === secret.park)!;

  it("hides in a park whose state name has the letter, at a print that exists", () => {
    expect(park).toBeDefined();
    expect(park.state.toUpperCase()).toContain(secret.letter);
    expect(secret.replaces).toBeLessThan(park.photos.length);
  });

  it("stays hidden until unlocked", () => {
    expect(withSecret(park.photos, park.slug, false)).toBe(park.photos);
  });

  it("replaces one print once unlocked, only in its park", () => {
    const shown = withSecret(park.photos, park.slug, true);
    expect(shown).toHaveLength(park.photos.length);
    expect(shown.filter((p) => p.secret)).toHaveLength(1);
    expect(shown[secret.replaces]).toMatchObject({ ...secret.item, secret: true });
    const other = parks.find((p) => p.slug !== secret.park)!;
    expect(withSecret(other.photos, other.slug, true)).toBe(other.photos);
  });
});

describe("secret print file", () => {
  it("lives in its own folder, out of reach of the curate export", () => {
    expect(secret.item.src).toMatch(/^\/media\/secret\//);
  });
});
