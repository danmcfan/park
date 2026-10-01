# Park Road Trip Site

Single-page static site of photos from a national park road trip:
**Zion → Bryce Canyon → Grand Teton → Yellowstone**. Live at
https://park.dannyobrien.dev (GitHub Pages, public repo).

Read `docs/PROJECT_SCOPE.md` and `docs/DESIGN.md` for scope and design intent.

## Stack
- **Bun only** — never npm/yarn/pnpm. `bun install`, `bun run dev`, `bun run build`.
- Vite + SolidJS, TypeScript (strict). `bun run typecheck`; `build` runs `tsc` first.
- Deploys via `.github/workflows/deploy.yml` on push to `main` (builds `dist/`).
- `public/CNAME` holds the custom domain — don't delete it.

## Layout
- `src/data/parks.ts` — all content (park themes, journal, facts, photos/videos). Media is
  placeholder until `src` is set; real media will live in `public/media/<slug>/`. Some fields
  (`hero`, `journal`, `facts`, `icons`, `map`, `legs`) aren't rendered yet.
- `src/App.tsx` — site title, then one `ParkSection` per park.
- `src/components/` — `ParkSection` (title block + gallery), `Gallery` (aligned collage
  grid; resizes a few tiles so every grid packs with no holes at 3 and 2 columns), `Media`
  (image, muted looping video, or placeholder), `Icon` (line icons, currently unused).
- `src/styles.css` — all styles; light and dark mode via `prefers-color-scheme`.
- The design is intentionally minimal right now; components get styled up one at a time.
  `docs/DESIGN.md` describes the earlier NPS-inspired direction.

## Conventions
- Only optimized media in the repo (WebP ~1600px, short 720p clips). Originals never committed.
- Respect `prefers-reduced-motion`.
- Screenshot-check changes with Playwright (Chromium at /opt/pw-browsers) against `bun run preview`.
- Sandbox network blocks nps.gov / Wikimedia; real photos must come via Drive or an allowed host.
