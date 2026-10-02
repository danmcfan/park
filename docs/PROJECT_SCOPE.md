# Project Scope

## Goal
A single, scroll-driven static website showing photos and short videos from our
road trip through four national parks, one "board" per park.

Parks (trip order): Zion, Bryce Canyon, Grand Teton, Yellowstone.

## Hosting: GitHub Pages (decided)

- Repo is **public**; site served at **https://park.dannyobrien.dev**.
- Built by GitHub Actions (`bun run build` → `dist/`) and deployed with
  `actions/deploy-pages`. Repo Settings → Pages → Source must be "GitHub Actions".
- DNS: `CNAME park → danmcfan.github.io` at the `dannyobrien.dev` registrar;
  `public/CNAME` contains `park.dannyobrien.dev`. Enable "Enforce HTTPS" once the cert issues.
- Limits to design around (these apply to the *built site*, not repo history):
  - Published site: ≤ 1 GB
  - Soft bandwidth: ~100 GB/month
  - Per-file hard limit: 100 MB (warning at 50 MB)
  - Git LFS files are **not** served by Pages — don't use LFS for site media.

## Media pipeline (Google Photos → repo)

Agents cannot read a personal Google Photos library directly. Since March 2025
the Google Photos Library API only exposes media an app itself uploaded;
arbitrary library access now goes through the interactive Picker API. So the
practical options, in order of preference:

1. **Google Drive handoff (recommended).** User downloads the album(s) from
   Google Photos (album → ⋮ → Download all) and uploads the zip/folders to a
   Drive folder, e.g. `Park Trip/<park>/`. Claude sessions have a Google Drive
   connector and can list/download from there.
2. **Google Takeout** export of the specific albums, then upload to Drive or
   hand over directly.
3. Manual drop into a local `raw/` folder (gitignored) in a local checkout.

Then the local curate tool (`curate/`, see its README) picks, captions and
clips the media and exports web-ready files:

| Type   | Output                                   | Target size |
|--------|------------------------------------------|-------------|
| Photo  | WebP, cropped to 4:3, at 800px, 1600px and 2400px long edge | 40–180 KB / 100–750 KB / 0.2–1.6 MB |
| Video  | H.264 MP4, 720p 30fps, no audio, short loops, cropped to 16:9, + WebP poster | 2–10 MB |

- All metadata, GPS included, is stripped (unit tests check every file).
- Output goes to `public/media/<park-slug>/`, listed in `src/data/media.ts`.
- Budget: ~40–60 photos + ~5 clips per park keeps total well under 500 MB.
- Long/full-quality videos: host on YouTube (unlisted) and embed instead.

## Decisions so far
- ~50 photos per park; captions on some photos (shown in the lightbox only).
- Park badges are the table of contents: a rail on desktop, a bar on phones.
  Clicking one scrolls to its park.
- Placeholders first; real photos next (done); videos last.
- Maybe later: a journal note per park.

## Out of scope (for now)
Backend, comments, auth, CMS, maps with live data.

## Open questions
- Real trip dates, total mileage, and caption/journal text.
- Which ~50 photos per park (user curates, uploads to Drive).
