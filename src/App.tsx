import { For } from "solid-js";
import { parks } from "./data/parks";
import ParkNav from "./components/ParkNav";
import ParkSection from "./components/ParkSection";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  return (
    <>
      <ParkNav />
      <ThemeToggle />
      <main>
        <For each={parks}>{(park) => <ParkSection park={park} />}</For>
      </main>
    </>
  );
}
