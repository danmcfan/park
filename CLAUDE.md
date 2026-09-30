# Park Road Trip Site

Single-page static site of photos from a national park road trip:
**Zion → Bryce Canyon → Grand Teton → Yellowstone**. Live at
https://park.dannyobrien.dev (GitHub Pages, public repo).

Read `docs/PROJECT_SCOPE.md` and `docs/DESIGN.md` for scope and design intent.

## Stack
- **Bun only** — never npm/yarn/pnpm. `bun install`, `bun run dev`, `bun run build`.
- Vite + SolidJS + GSAP (ScrollTrigger).
- Deploys via `.github/workflows/deploy.yml` on push to `main` (builds `dist/`).
- `public/CNAME` holds the custom domain — don't delete it.

## Layout
- `src/data/parks.js` — all content (park themes, map coords, journal, photos). Photos are
  inline-SVG placeholders for now; real media will live in `public/media/<slug>/`.
- `src/App.jsx` — page structure + all ScrollTrigger wiring (active park, route progress,
  photo drop-in, parallax).
- `src/components/` — `Board` (corkboard per park), `RouteMap` (SVG route/TOC used in sidebar
  and full-screen "drive" sections), `Icon` (magnet/sticker glyphs).
- `src/styles.css` — all styles; mobile swaps sidebar map for a top chip bar.

## Conventions
- Only optimized media in the repo (WebP ~1600px, short 720p clips). Originals never committed.
- Respect `prefers-reduced-motion`.
- Screenshot-check changes with Playwright (Chromium at /opt/pw-browsers) against `bun run preview`.
