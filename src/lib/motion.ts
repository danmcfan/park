// Read once at load: videos decide on autoplay and controls when created.
export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
