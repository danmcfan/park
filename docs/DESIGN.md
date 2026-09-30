# Design Concept

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

## Tech approach (proposed)
- Vanilla HTML/CSS/JS; GSAP + ScrollTrigger from CDN for scroll choreography
  (or native CSS scroll-driven animations with a fallback).
- Lazy-load images (`loading="lazy"`, `srcset`), videos with `preload="none"`
  and poster images; play/pause via IntersectionObserver.
- Board textures: CSS/SVG noise for cork, or small tiling JPG.
- Mobile: single column of pinned photos, lighter animation.

## Next steps
1. Answer open questions in `PROJECT_SCOPE.md`.
2. Build a static mockup with placeholder images for one park (Zion).
3. Set up media processing script + Drive handoff.
4. Roll out remaining parks; enable Pages.
