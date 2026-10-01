import { For } from "solid-js";
import { parks } from "./data/parks";
import ParkSection from "./components/ParkSection";

export default function App() {
  return (
    <main>
      <header class="site-title">
        <h1>Canyons to Geysers</h1>
        <p>Zion, Bryce Canyon, Grand Teton and Yellowstone</p>
      </header>
      <For each={parks}>{(park) => <ParkSection park={park} />}</For>
    </main>
  );
}
