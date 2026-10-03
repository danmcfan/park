import type { Park } from "../data/parks";
import Gallery from "./Gallery";
import StateMap from "./StateMap";
import { unlocked, withSecret } from "../lib/secret";

export default function ParkSection(props: { park: Park }) {
  return (
    <section id={props.park.slug} class="park" style={{ "--accent": props.park.accent }}>
      <header class="park-title">
        <h2>{props.park.name}</h2>
        <StateMap park={props.park} />
      </header>
      <Gallery items={withSecret(props.park.photos, props.park.slug, unlocked())} />
    </section>
  );
}
