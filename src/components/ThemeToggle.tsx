import Moon from "lucide-solid/icons/moon";
import Sun from "lucide-solid/icons/sun";
import { Show, createSignal, onCleanup, onMount } from "solid-js";

// Day/night switch. index.html sets `data-theme` on <html> before first paint
// (saved choice, else the system setting); this keeps it in sync after that.
// A saved choice wins; with none, the page follows the system setting live.

export type Theme = "day" | "night";
export const THEME_KEY = "theme";

const current = (): Theme => (document.documentElement.dataset.theme === "night" ? "night" : "day");

const apply = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
};

export default function ThemeToggle() {
  const [theme, setTheme] = createSignal<Theme>(current());

  onMount(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(THEME_KEY);
      } catch {}
      if (saved) return;
      apply(e.matches ? "night" : "day");
      setTheme(current());
    };
    system.addEventListener("change", follow);
    onCleanup(() => system.removeEventListener("change", follow));
  });

  const toggle = () => {
    const next: Theme = theme() === "day" ? "night" : "day";
    apply(next);
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  const label = () => (theme() === "day" ? "Switch to night mode" : "Switch to day mode");

  return (
    <button class="theme-toggle" type="button" aria-label={label()} title={label()} onClick={toggle}>
      <Show when={theme() === "day"} fallback={<Moon aria-hidden="true" />}>
        <Sun aria-hidden="true" />
      </Show>
    </button>
  );
}
