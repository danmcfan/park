# Park Road Trip Site

Single-page static site of photos from a national park road trip:
**Zion → Bryce Canyon → Grand Teton → Yellowstone**. Live at
https://park.dannyobrien.dev (GitHub Pages, public repo).

Read `docs/PROJECT_SCOPE.md` and `docs/DESIGN.md` for scope and design intent.

## Stack
- **Bun only** — never npm/yarn/pnpm. `bun install`, `bun run dev`, `bun run build`.
- Vite + SolidJS, TypeScript (strict, plus no unused locals/parameters), Fraunces (titles)
  + Work Sans (text) from Google Fonts, Lucide icons (`lucide-solid/icons/<name>`, one
  import per icon). `bun run typecheck` checks app, tests, `curate/` and `scripts/`;
  `build` runs it first.
- Deploys via `.github/workflows/deploy.yml` on push to `main` (builds `dist/`) once the
  unit tests and build pass. The e2e suite is for local verification only.
- `public/CNAME` holds the custom domain — don't delete it.

## Layout
- `src/data/parks.ts` — the parks in trip order (name, state, pin location, `accent` color,
  placeholder slots) and `aspectOf`. Real media is in `src/data/media.ts` (written by the
  curate tool's export); aspect is fixed by the iPhone 17 Pro (photos 4:3, videos 16:9,
  either orientation). Media without `src` is a placeholder.
- `src/App.tsx` — `ParkNav`, then one `ParkSection` per park (no site title; the page starts at Zion).
- `src/lib/justify.ts` — gallery layout math (row partition, row count, print tilt/tape).
  `src/lib/motion.ts` — the `prefers-reduced-motion` flag.
- `src/components/` — `ParkNav` (embroidered badge links on a canvas sash: fixed left rail ≥900px,
  sticky top bar below), `ThemeToggle` (rust day/night patch, top right, contrasting with the sash), `ParkSection` (park name + `StateMap`, then the gallery), `StateMap` (the
  park's state from `src/data/states.ts`, projected in `src/lib/geo.ts`, as a cork board with a
  visible cut edge and cast shadow — SVG turbulence texture, no WebGL — with a CSS ball-head pin
  at the park's `location` and the state's name inside), `Gallery` (justified rows: items
  keep their true aspect, rows balanced so every row incl. the last spans the full width),
  `Gallery` prints are white-bordered, taped, slightly tilted. `Media` (image, muted loop video
  that plays only while on screen, or placeholder),
  `Lightbox` (modal `<dialog>` viewer per gallery: arrows/swipe, Esc/backdrop to close).
- `src/styles.css` — all styles; light and dark mode via `prefers-color-scheme`.
- Design: a tidy scrapbook on canvas (aligned rows, small tilts, captions only in the lightbox);
  see `docs/DESIGN.md`.

## Conventions
- Only optimized media in the repo, metadata (incl. GPS) always stripped. Originals never committed.
  - Photos, at three sizes: `magick IN.JPG -auto-orient -resize '1600x1600>' -strip -quality 82 OUT.webp`
    and the same with `'800x800>'` into `OUT-800.webp` and `'2400x2400>'` into `OUT-2400.webp`.
    Gallery prints offer 800/1600 with `sizes` = each print's laid-out width; the lightbox offers
    all three with `sizes` from `src/lib/lightbox.ts` (mirrors `.lightbox-media` in the CSS), so
    Retina screens get 2400 full screen. Sizes and naming live in `parks.ts` (`PHOTO_PX`, `sizedSrc`).
  - Videos (rotation baked in, no audio, 30fps 720p) plus a poster frame:
    `ffmpeg -i IN.MOV -map 0:v:0 -an -map_metadata -1 -vf "scale='if(gt(iw,ih),-2,720)':'if(gt(iw,ih),720,-2)',fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart OUT.mp4`
- Respect `prefers-reduced-motion`.
- Use Lucide for UI icons; don't hand-draw SVGs.
- Theme: `<html data-theme="day|night">`, set before first paint by the inline script in
  `index.html` (saved choice, else system). All colors are tokens on `:root` / `[data-theme="night"]`.

## Testing
- `bun run test` — Vitest unit tests (`src/**/*.test.ts`, `curate/**/*.test.ts`): gallery
  layout math, state maps, content data (every media/badge file exists, posters), and the
  media files themselves (true size and shape, no EXIF/XMP/GPS, no audio, no unused files).
- `bun run test:e2e` — Playwright (`e2e/`) against a production build on desktop Chromium and
  iPhone WebKit: layout, nav, media playback, lightbox, theme, reduced motion. Any page error or
  console error fails a test. Expectations are derived from `parks`/`media`, never hard-coded
  counts or captions; video tests skip until the trip has videos.
  `@playwright/test` is pinned to the locally installed browsers.
  `BASE_URL=https://park.dannyobrien.dev bun run test:e2e` runs the same suite against the live site.
- `bun run test:all` runs both. Add or update tests with every change.
- Sandbox network blocks nps.gov / Wikimedia; real photos must come via Drive or an allowed host.

## Curate tool (temporary, local only)
- `curate/` picks, captions and clips media from a raw dump and exports it for the site:
  `bun run curate [dump]` (default `raw/dump/`), then open http://127.0.0.1:5199. Details and
  removal steps in `curate/README.md`.
- Export rewrites `public/media/<park>/` to exactly the included items and regenerates
  `src/data/media.ts` (each park's real media, in capture order; parks without any show
  placeholders from `parks.ts`). Choices live in `raw/curate.json`, caches in `raw/.curate-cache/`.
- It's built to be deleted: nothing in `src/` imports it.

## Park badges
- Generated with Replicate (`openai/gpt-image-2.5-sunburst`) by `bun scripts/badge.ts <slug> [count]`;
  needs `REPLICATE_API_TOKEN` in `.env` (gitignored). Prompt and per-park scenes live in the script.
- Candidates land in `raw/badges/<slug>-<n>.png` (gitignored, local only). References for style are
  in `raw/badge-refs/`; they're third-party designs, so prompts must ask for an original design.
- `scripts/cut-badge.sh <slug> [option]` cuts the chosen one off its white background into
  `public/media/badges/<slug>.webp`, which `ParkNav` uses. In use: zion 1, bryce 3, grand-teton 3, yellowstone 3.

