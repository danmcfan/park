# Project Scope

## Goal
A single, scroll-driven static website showing photos and short videos from our
road trip through four national parks, one "board" per park.

Parks (trip order): Zion, Bryce Canyon, Grand Teton, Yellowstone.

## Hosting: GitHub Pages

- **Private repo + Pages requires a paid plan** (GitHub Pro, Team, or Enterprise).
  On GitHub Free, Pages only works on public repos.
- **The published site is public regardless of repo visibility** (only
  Enterprise Cloud offers access-controlled Pages). Anyone with the URL can see
  the photos. Decide if that's acceptable.
- Limits to design around:
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

Then a script (to be written, e.g. `scripts/process_media.sh` using
ImageMagick/`cwebp` + `ffmpeg`) produces web-ready files:

| Type   | Output                                   | Target size |
|--------|------------------------------------------|-------------|
| Photo  | WebP (optionally AVIF) @ 1600px long edge + 400px thumb | 150–400 KB |
| Video  | H.264 MP4, 720p, ≤ 30–45 s clips, no audio for ambient loops, + poster JPG | 2–10 MB |

- Strip EXIF GPS if location privacy matters.
- Output to `media/<park-slug>/`, plus a manifest `data/<park-slug>.json`
  (file, caption, date, orientation, width/height) that the page renders from.
- Budget: ~40–60 photos + ~5 clips per park keeps total well under 500 MB.
- Long/full-quality videos: host on YouTube (unlisted) and embed instead.

## Out of scope (for now)
Backend, comments, auth, CMS, maps with live data.

## Open questions for the user
- OK with the site being publicly viewable? Paid plan available for private repo?
- Custom domain?
- Roughly how many photos/videos per park, and who curates the selection?
- Captions/journal text per park, or photos only?
- Should the trip route (map between parks) be a section?
