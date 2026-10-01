import { For } from "solid-js";
import { parks } from "./data/parks";
import ParkNav from "./components/ParkNav";
import ParkSection from "./components/ParkSection";

export default function App() {
  return (
    <>
      <ParkNav />
      <main>
        <For each={parks}>{(park) => <ParkSection park={park} />}</For>
      </main>
    </>
  );
}
