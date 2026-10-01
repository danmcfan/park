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
- `src/data/parks.ts` — all content (park themes, journal, facts, photos/videos). Items use
  `photo(orientation, caption, src)` / `video(orientation, caption, src, poster)`; aspect is
  fixed by the iPhone 17 Pro (photos 4:3, videos 16:9, either orientation). Media without
  `src` is a placeholder. Some fields (`hero`, `journal`, `facts`, `icons`, `map`, `legs`)
  aren't rendered yet.
- `src/App.tsx` — site title, then one `ParkSection` per park.
- `src/components/` — `ParkSection` (title block + gallery), `Gallery` (justified rows: items
  keep their true aspect, rows balanced so every row incl. the last spans the full width),
  `Media` (image, muted loop video that plays only while on screen, or placeholder), `Icon`
  (line icons, currently unused).
- `src/styles.css` — all styles; light and dark mode via `prefers-color-scheme`.
- The design is intentionally minimal right now; components get styled up one at a time.
  `docs/DESIGN.md` describes the earlier NPS-inspired direction.

## Conventions
- Only optimized media in the repo, metadata (incl. GPS) always stripped. Originals never committed.
  - Photos: `magick IN.JPG -auto-orient -resize '1600x1600>' -strip -quality 82 OUT.webp`
  - Videos (rotation baked in, no audio, 30fps 720p) plus a poster frame:
    `ffmpeg -i IN.MOV -map 0:v:0 -an -map_metadata -1 -vf "scale='if(gt(iw,ih),-2,720)':'if(gt(iw,ih),720,-2)',fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart OUT.mp4`
- Respect `prefers-reduced-motion`.
- Screenshot-check changes with Playwright (Chromium at /opt/pw-browsers) against `bun run preview`.
- Sandbox network blocks nps.gov / Wikimedia; real photos must come via Drive or an allowed host.
