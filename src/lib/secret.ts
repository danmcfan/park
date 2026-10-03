import { createSignal } from "solid-js";
import type { PhotoSlot } from "../data/parks";
import { secret } from "../data/secret";

// Unlocked for the rest of the visit once the pin lands on the letter.
const [unlocked, setUnlocked] = createSignal(false);
export { unlocked };
export const unlock = () => setUnlocked(true);

// A park's prints, with the secret one swapped in once unlocked.
export const withSecret = (items: PhotoSlot[], park: string, open: boolean): PhotoSlot[] =>
  open && park === secret.park && secret.replaces < items.length
    ? items.map((item, i) => (i === secret.replaces ? { ...secret.item, secret: true } : item))
    : items;
