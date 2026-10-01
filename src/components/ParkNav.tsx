import { For } from "solid-js";
import { parks } from "../data/parks";

// Embroidered park badges as navigation: a vertical rail on the left on
// desktop, a horizontal bar across the top on phones. Plain hash links, so it
// works without JS; smooth scrolling comes from CSS.
export default function ParkNav() {
  return (
    <nav class="park-nav" aria-label="Parks">
      <For each={parks}>
        {(park) => (
          <a class="park-nav-badge" href={`#${park.slug}`}>
            <img src={`/media/badges/${park.slug}.webp`} alt={`${park.name} National Park`} />
          </a>
        )}
      </For>
    </nav>
  );
}
