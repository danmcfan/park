// Simple sticker-style glyphs for magnets. Drawn in a 24x24 box with
// currentColor so each park theme can recolor them.
const glyphs = {
  mountain: () => <path d="M2 20 9 7l4 6 3-4 6 11z" />,
  peaks: () => <path d="M1 20 7 8l3 5 4-10 4 8 2-2 3 11z" />,
  cactus: () => <path d="M10 21V5a2 2 0 0 1 4 0v16zM6 13V9a1.5 1.5 0 0 1 3 0v4h1v2H8a2 2 0 0 1-2-2m12-2V8a1.5 1.5 0 0 0-3 0v5h-1v2h2a2 2 0 0 0 2-2z" />,
  sun: () => <g><circle cx="12" cy="12" r="5" /><path d="M11 1h2v4h-2zm0 18h2v4h-2zM1 11h4v2H1zm18 0h4v2h-4z" /></g>,
  sheep: () => <path d="M5 10a4 4 0 0 1 7-3 4 4 0 0 1 7 3 3 3 0 0 1-1 5H8v4H6v-4a3 3 0 0 1-1-5m11 5h2v4h-2zM3 8a3 3 0 0 1 3-3v3z" />,
  hoodoo: () => <path d="M9 21h6l-1-4 1-3-1-3 1-2-1-3h1V4H9v2h1l-1 3 1 2-1 3 1 3z" />,
  pine: () => <path d="m12 2 6 8h-3l4 6h-6v5h-2v-5H5l4-6H6z" />,
  star: () => <path d="m12 2 3 7 7 .6-5.3 4.6L18.3 21 12 17.3 5.7 21l1.6-6.8L2 9.6 9 9z" />,
  moon: () => <path d="M15 3a9 9 0 1 0 6 13A8 8 0 0 1 15 3" />,
  moose: () => <path d="M3 5l2 3h3l1-3 1 3h4l1-3 1 3h3l2-3v4l-3 2h-3v2l3 2v7h-2v-5H8v5H6v-7l3-2v-2H6L3 9z" />,
  barn: () => <path d="M2 11 12 3l10 8v10H2zm8 10v-6h4v6zm-4-9h3v2H6zm9 0h3v2h-3z" />,
  canoe: () => <path d="M1 13h22c-2 4-6 5-11 5S3 17 1 13m10-10h2v8h-2zm-1 7h4l-2 3z" />,
  geyser: () => <path d="M11 3h2l1 6c1-1 3-1 3 1s-2 3-4 3h-2c-2 0-4-1-4-3s2-2 3-1zM4 20c2-4 5-6 8-6s6 2 8 6z" />,
  bison: () => <path d="M3 13c0-4 3-7 7-7 3 0 5 1 7 3l4 1-1 3-3 1v5h-2v-3H9v3H7v-4c-2 0-4-1-4-2" />,
  spring: () => <g><circle cx="12" cy="12" r="10" opacity=".35" /><circle cx="12" cy="12" r="6" opacity=".6" /><circle cx="12" cy="12" r="3" /></g>,
  bear: () => <path d="M5 8a2 2 0 1 1 3-2 8 8 0 0 1 8 0 2 2 0 1 1 3 2 7 7 0 0 1 1 4c0 5-4 9-8 9s-8-4-8-9a7 7 0 0 1 1-4m5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2m4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-3 3h2l-1 1z" />,
};

export default function Icon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class={props.class}>
      {glyphs[props.name]?.()}
    </svg>
  );
}
