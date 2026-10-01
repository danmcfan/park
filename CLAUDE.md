# Park Road Trip Site

Single-page static site of photos from a national park road trip:
**Zion → Bryce Canyon → Grand Teton → Yellowstone**. Live at
https://park.dannyobrien.dev (GitHub Pages, public repo).

Read `docs/PROJECT_SCOPE.md` and `docs/DESIGN.md` for scope and design intent.

## Stack
- **Bun only** — never npm/yarn/pnpm. `bun install`, `bun run dev`, `bun run build`.
- Vite + SolidJS, TypeScript (strict), Lucide icons (`lucide-solid/icons/<name>`, one import per
  icon). `bun run typecheck` checks app and tests; `build` runs it first.
- Deploys via `.github/workflows/deploy.yml` on push to `main` (builds `dist/`).
- `public/CNAME` holds the custom domain — don't delete it.

## Layout
- `src/data/parks.ts` — all content (park themes, journal, facts, photos/videos). Items use
  `photo(orientation, caption, src)` / `video(orientation, caption, src, poster)`; aspect is
  fixed by the iPhone 17 Pro (photos 4:3, videos 16:9, either orientation). Media without
  `src` is a placeholder. Some fields (`hero`, `journal`, `facts`, `icons`, `map`, `legs`)
  aren't rendered yet.
- `src/App.tsx` — `ParkNav`, then one `ParkSection` per park (no site title; the page starts at Zion).
- `src/lib/justify.ts` — gallery layout math (row partition, row count, print tilt/tape).
- `src/components/` — `ParkNav` (embroidered badge links on a canvas sash: fixed left rail ≥900px,
  sticky top bar below), `ThemeToggle` (day/night patch, top right), `ParkSection` (title block + gallery), `Gallery` (justified rows: items
  keep their true aspect, rows balanced so every row incl. the last spans the full width),
  `Gallery` prints are white-bordered, taped, slightly tilted. `Media` (image, muted loop video
  that plays only while on screen, or placeholder),
  `Lightbox` (modal `<dialog>` viewer per gallery: arrows/swipe, Esc/backdrop to close), `Icon`
  (line icons, currently unused).
- `src/styles.css` — all styles; light and dark mode via `prefers-color-scheme`.
- Design: a tidy scrapbook on canvas (aligned rows, small tilts, captions only in the lightbox).
  `docs/DESIGN.md` describes the earlier NPS-inspired direction and is out of date.

## Conventions
- Only optimized media in the repo, metadata (incl. GPS) always stripped. Originals never committed.
  - Photos: `magick IN.JPG -auto-orient -resize '1600x1600>' -strip -quality 82 OUT.webp`
  - Videos (rotation baked in, no audio, 30fps 720p) plus a poster frame:
    `ffmpeg -i IN.MOV -map 0:v:0 -an -map_metadata -1 -vf "scale='if(gt(iw,ih),-2,720)':'if(gt(iw,ih),720,-2)',fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart OUT.mp4`
- Respect `prefers-reduced-motion`.
- Use Lucide for UI icons; don't hand-draw SVGs.
- Theme: `<html data-theme="day|night">`, set before first paint by the inline script in
  `index.html` (saved choice, else system). All colors are tokens on `:root` / `[data-theme="night"]`.

## Testing
- `bun run test` — Vitest unit tests (`src/**/*.test.ts`): gallery layout math, content data
  (every media/badge file exists, captions, posters). Runs in CI before every deploy.
- `bun run test:e2e` — Playwright (`e2e/`) against a production build on desktop Chromium and
  iPhone WebKit: layout, nav, media playback, lightbox, theme, reduced motion. Any page error or
  console error fails a test. `@playwright/test` is pinned to the locally installed browsers.
  `BASE_URL=https://park.dannyobrien.dev bun run test:e2e` runs the same suite against the live site.
- `bun run test:all` runs both. Add or update tests with every change.
- Sandbox network blocks nps.gov / Wikimedia; real photos must come via Drive or an allowed host.

## Park badges
- Generated with Replicate (`openai/gpt-image-2.5-sunburst`) by `bun scripts/badge.ts <slug> [count]`;
  needs `REPLICATE_API_TOKEN` in `.env` (gitignored). Prompt and per-park scenes live in the script.
- Candidates land in `raw/badges/<slug>-<n>.png` (gitignored, local only). References for style are
  in `raw/badge-refs/`; they're third-party designs, so prompts must ask for an original design.
- `scripts/cut-badge.sh <slug> [option]` cuts the chosen one off its white background into
  `public/media/badges/<slug>.webp`, which `ParkNav` uses. Option 1 of each is in use now.

