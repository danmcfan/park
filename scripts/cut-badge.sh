#!/usr/bin/env bash
# Cut a generated badge out of its white background into a transparent WebP.
#
#   scripts/cut-badge.sh <slug> [option]   # option defaults to 1
#
# Reads raw/badges/<slug>-<option>.png, writes public/media/badges/<slug>.webp
# (320px tall, about 2x the size it's shown at in the nav).
set -euo pipefail

slug=$1
option=${2:-1}
src=raw/badges/$slug-$option.png
out=public/media/badges/$slug.webp
mkdir -p "$(dirname "$out")"

# Flood-fill the white inward from each corner (so white thread inside the
# badge is kept), shrink the mask 1px to drop the anti-aliased white fringe,
# soften it slightly, then trim to the badge.
magick "$src" -alpha set -fuzz 6% -fill none \
  -draw "color 0,0 floodfill" -draw "color %[fx:w-1],0 floodfill" \
  -draw "color 0,%[fx:h-1] floodfill" -draw "color %[fx:w-1],%[fx:h-1] floodfill" \
  -channel A -morphology Erode Disk:1 -blur 0x0.7 +channel \
  -trim +repage -resize x320 -strip -define webp:alpha-quality=100 -quality 85 "$out"

magick "$out" -format "$out %wx%h\n" info:
