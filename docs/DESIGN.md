# Design Concept

## Direction (v2 — NPS-inspired)
The look borrows from National Park Service print and web design so it reads as
considered rather than generated:
- **Unigrid black band**: fixed black top bar (wordmark + park nav) and a black title
  band opening every park section.
- **Type**: Source Sans 3 (stand-in for Frutiger) for UI/labels, Source Serif 4 (stand-in
  for NPS Rawlinson) for titles and journal text. Small-caps tracked labels for metadata.
  No handwriting fonts.
- **Photography first**: full-bleed hero per park with a slow zoom-out on scroll; caption line
  beneath like a brochure credit.
- **Brochure map**: flat tan states, dotted planned route, solid black traveled route,
  accent dot for "you are here". Doubles as navigation (sidebar rail on desktop ≥1100px).
- **Board**: the bulletin board survives as a framed felt panel in the park's deep color.
  Prints are white-bordered with ±1.6° tilt; every third print is held by an enamel-pin
  magnet with a park line icon, the rest by plain round magnets. Pin badges sit top-right.
- **Motion**: restrained — power3 ease-outs, prints rise into place, magnets pop in after,
  no bouncing. Reduced-motion disables all of it.
- Each park has 4 theme colors (`accent`, `deep`, `soft`, `board`) in `src/data/parks.js`.
- Photo slots have fixed shapes (`wide` 3:2 / `tall` 4:5 / `square`); a row is
  wide + tall + square on the 12-col grid, so keep counts in multiples of 3.

Zion is the reference section; other parks inherit the same components.

## Original concept (v1, superseded where it conflicts)

## Big idea
Each park is a **corkboard / bulletin board** you scroll through. Photos are
pinned or held by **park-themed magnets and pins**; small cut-out icons,
ticket stubs, and stickers decorate the board. Scrolling "travels" the road
trip from one board to the next.

## Page structure
1. **Hero / intro** — trip title, dates, a hand-drawn route line
   Zion → Bryce → Grand Teton → Yellowstone that draws itself on scroll.
2. **One board section per park** (in trip order), each with:
   - Board header: park name on a "trail sign" or NPS-arrowhead-inspired
     (not the official logo) badge, dates visited.
   - Photos as polaroids/prints with slight random rotation and drop shadow,
     held by a magnet/pushpin/tape strip.
   - 1–3 videos as "instant film" frames that autoplay muted when in view.
   - Decorative icons and optional handwritten captions.
3. **Transition between parks** — road/van moving along the route line, the
   board background swapping texture/color.
4. **Outro** — full-route map, favorite shot, thanks.

## Per-park theme
| Park         | Palette                        | Magnet / icon ideas                          |
|--------------|--------------------------------|----------------------------------------------|
| Zion         | red sandstone, sage, sky blue  | Angels Landing, cactus, bighorn sheep, shuttle |
| Bryce Canyon | orange/pink hoodoos, snow white| hoodoo, pine, stars/night sky, Thor's Hammer |
| Grand Teton  | slate blue, alpine green       | Teton peaks, moose, barn (Mormon Row), canoe |
| Yellowstone  | geyser teal, sulfur yellow     | Old Faithful, bison, Grand Prismatic, bear   |

Icons: custom SVGs (hand-drawn/flat sticker style) so they're small and
recolorable. Avoid official NPS logos/trademarks.

## Motion (scroll-driven)
- Photos "drop and pin" into place as they enter the viewport (slight bounce,
  rotation settle).
- Parallax: board texture slower than photos; magnets slightly faster.
- Section pin: board stays fixed while photos fly in, then releases.
- Hover/tap: photo lifts (scale + stronger shadow); click opens lightbox.
- Respect `prefers-reduced-motion` (fade only).

## Route map as navigation
Sticky sidebar map (left) while inside a park, with the current stop highlighted and a
van marker. Between parks a tall "drive" section pins a large centered map and the van
drives along the route as you scroll. Stops are clickable → smooth-scroll to that park.

## Tech approach (implemented)
- Bun + Vite + SolidJS; GSAP ScrollTrigger for scroll choreography.
- Lazy-load images (`loading="lazy"`, `srcset`), videos with `preload="none"`
  and poster images; play/pause via IntersectionObserver.
- Board textures: CSS/SVG noise for cork, or small tiling JPG.
- Mobile: single column of pinned photos, lighter animation.

## Next steps
1. ~~Placeholder mockup of all four boards + route nav~~ (done).
2. Media processing script + Google Drive handoff; swap placeholders for real photos.
3. Styling polish (hand-drawn map art, better magnets, real park-specific stickers).
4. Videos.
