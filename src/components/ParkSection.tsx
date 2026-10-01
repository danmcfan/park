import type { Park } from "../data/parks";
import Gallery from "./Gallery";

export default function ParkSection(props: { park: Park }) {
  return (
    <section id={props.park.slug} class="park" style={{ "--accent": props.park.theme.accent }}>
      <header class="park-title">
        <h2>{props.park.name}</h2>
        <p>
          {props.park.state} · {props.park.dates}
        </p>
      </header>
      <Gallery items={props.park.photos} />
    </section>
  );
}
