# Design

A tidy scrapbook on canvas: one page, one section per park in trip order
(Zion → Bryce Canyon → Grand Teton → Yellowstone), no site title — the page
opens on Zion.

## Look
- **Canvas page.** The background is cotton duck canvas: fine crossing threads
  plus a little SVG noise (`--weave` in `styles.css`), no image files.
- **Badge sash (navigation).** Each park's embroidered badge sits on a stitched
  canvas sash: a fixed rail on the left from 900px up, a fixed bar across the
  top below that. Badges are plain `#slug` links (works without JS); hover tilts
  and enlarges them where there's a real pointer.
- **Day/night patch.** A round rust twill patch in the top right toggles the
  theme. It deliberately contrasts with the sash, since on phones it sits on it.
- **Park title.** The name in Fraunces, a dashed stitch line in the park's
  `accent` color, and the park's state cut from cork board at true proportions,
  standing a few millimetres proud of the page with a cast shadow, its name
  printed on it, and a ball-head map pin pushed in where the park is.
- **Gallery.** Photos and videos are white-bordered prints in justified rows:
  every item keeps its true aspect (the border trims only a few pixels) and
  every row, including the last, spans the full width. Each print has a small stable tilt (0.4–1.4°,
  alternating) and one of three tape styles, both derived from its file name so
  they never change between visits. Captions are not shown on the board.
- **Lightbox.** Clicking a print opens it full screen on a near-black backdrop
  (whatever the theme, so colors read true) with its caption and a count.
  Arrows, swipe, Esc and backdrop click work as expected.

## Type
Fraunces (soft, slightly wonky) for park names; Work Sans for everything else.

## Color
Every color is a token on `:root`, redefined under `[data-theme="night"]`. Night
is the same canvas under lamplight, prints dimmed a touch. Each park adds one
`accent` (title stitching, pin head).

## Motion
Small and physical: prints straighten and lift on hover, the map pin drops in
and rocks once the first time its map is seen, badges tilt on hover, videos
loop muted only while on screen. With `prefers-reduced-motion` all of it is
off: pins are already in, nothing transitions, videos wait with controls.

## Media
Shot on an iPhone 17 Pro, so shapes are fixed: photos 4:3, videos 16:9, either
way up. The gallery relies on that instead of measuring files.
