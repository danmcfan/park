// Line icons for the enamel-pin magnets. 24x24, stroked with currentColor.
import type { JSX } from "solid-js";

const glyphs = {
  canyon: () => <path d="M2 20h20M3 20V9l4-3v14M21 20V7l-4 2v11M10 20v-6h4v6" />,
  sun: () => (
    <g>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </g>
  ),
  river: () => <path d="M3 8c3-2 6 2 9 0s6-2 9 0M3 13c3-2 6 2 9 0s6-2 9 0M3 18c3-2 6 2 9 0s6-2 9 0" />,
  cactus: () => <path d="M12 21V5a2 2 0 0 1 4 0v16M8 21h12M16 12h2a2 2 0 0 0 2-2V8M12 14h-2a2 2 0 0 1-2-2V9" />,
  hoodoo: () => <path d="M3 21h18M9 21l1-5-1-4 1-4-1-3h6l-1 3 1 4-1 4 1 5" />,
  pine: () => <path d="M12 2 6 10h3l-4 6h14l-4-6h3zM12 16v6" />,
  star: () => <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" />,
  moon: () => <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5" />,
  peaks: () => <path d="M2 20 8 9l3 5 4-9 7 15zM13 9.5l2-4.5 2 4.5" />,
  moose: () => <path d="M4 5c0 3 2 4 4 4h8c2 0 4-1 4-4M8 9v3l-2 3v5M16 9v3l2 3v5M8 12h8M10 16h4" />,
  barn: () => <path d="M3 21V10l9-6 9 6v11zM9 21v-6h6v6M3 10h18" />,
  canoe: () => <path d="M2 14h20c-2 4-6 5-10 5S4 18 2 14M9 4l6 9M8 9h4" />,
  geyser: () => <path d="M12 21v-9M9 14c-1-3 0-5 3-9 3 4 4 6 3 9M4 21h16" />,
  bison: () => <path d="M3 14c0-4 3-7 8-7 3 0 5 1 6 3l4 1-1 3h-3v6M6 20v-4M10 20v-4h5M3 14c1 1 2 2 3 2" />,
  spring: () => (
    <g>
      <ellipse cx="12" cy="12" rx="10" ry="6" />
      <ellipse cx="12" cy="12" rx="6" ry="3.5" />
      <ellipse cx="12" cy="12" rx="2" ry="1" />
    </g>
  ),
  bear: () => <path d="M7 7a2 2 0 1 1 2-2M17 7a2 2 0 1 0-2-2M5 13a7 7 0 0 1 14 0v2a7 7 0 0 1-14 0zM10 12h.01M14 12h.01M11 16h2" />,
} satisfies Record<string, () => JSX.Element>;

export type IconName = keyof typeof glyphs;

export default function Icon(props: { name: IconName; class?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={props.class}
    >
      {glyphs[props.name]?.()}
    </svg>
  );
}
