// The lightbox shows media at this width (CSS px) in a vw × vh window, worked
// out as `.lightbox-media` in styles.css does: as wide as fits beside the
// padding and as tall as fits above the caption. Keep the two in step; an
// e2e test checks they agree.
export function lightboxWidth(vw: number, vh: number, aspect: number) {
  const pad = Math.min(Math.max(12, 0.04 * vw), 56); // --pad: clamp(12px, 4vw, 56px)
  const caption = 56; // --caption
  return Math.min(vw - 2 * pad, (vh - 2 * pad - caption) * aspect);
}
