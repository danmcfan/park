# Curate (local only, temporary)

A throwaway tool for getting the trip's photos and videos onto the site. It is
not part of the public site and never deploys; delete it when you're done.

## Use

1. Put the whole dump (HEIC/JPG/PNG photos, MOV/MP4 videos, subfolders fine) in
   `raw/dump/` (gitignored), or pass another folder.
2. `bun run curate` (or `bun run curate ~/path/to/dump`) and open http://127.0.0.1:5199.
3. Tick **Include**, choose the park (preset from GPS when the file has it) and
   write a caption. Click a thumbnail for the viewer: for videos, set the clip's
   start and end and the poster frame. Keys: ←/→ next/previous, X include,
   I/O start/end at the playhead, P poster, C play the clip, Space play/pause, Esc close.
4. **Export to site** builds every included item into `public/media/<park>/`
   (WebP photos, 720p H.264 clips with posters, all metadata and GPS stripped,
   cropped to 4:3 / 16:9) and rewrites `src/data/media.ts`. Those park folders
   end up holding exactly what you included, in capture order.
5. Check with `bun run dev`, then commit `public/media/` and `src/data/media.ts`.

Choices are saved as you go in `raw/curate.json`; previews and export builds are
cached in `raw/.curate-cache/` (both gitignored, safe to delete).

## Remove

Everything the site needs is in `public/media/` and `src/data/media.ts`, so:

- delete `curate/`
- in `package.json`, remove the `curate` script and `&& tsc -p curate` from `typecheck`
  (keep `@types/bun`: `scripts/` uses it too)
- in `vitest.config.ts`, remove `"curate/**/*.test.ts"`
- remove the "Curate tool" section from `CLAUDE.md` and the media.ts comment's mention of it
