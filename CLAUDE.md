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
- `src/components/` — `Board` (park section: black band, hero, journal/facts, felt photo board),
  `RouteMap` (brochure-style SVG route used in the rail and full-screen "drive" sections),
  `Photo` (image or tinted placeholder at a fixed aspect), `Icon` (line icons for enamel pins).
- `src/styles.css` — all styles; below 1100px the route rail hides and the top bar nav is the TOC.
- Design direction is NPS-inspired (see `docs/DESIGN.md` v2) — keep it restrained.

## Conventions
- Only optimized media in the repo (WebP ~1600px, short 720p clips). Originals never committed.
- Respect `prefers-reduced-motion`.
- Screenshot-check changes with Playwright (Chromium at /opt/pw-browsers) against `bun run preview`.
- Sandbox network blocks nps.gov / Wikimedia; real photos must come via Drive or an allowed host.
