import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { parks } from "./data/parks";
import RouteMap from "./components/RouteMap";
import Board from "./components/Board";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [progress, setProgress] = createSignal(0);
  const [active, setActive] = createSignal(-1);
  const [mapCentered, setMapCentered] = createSignal(false);
  const [lightbox, setLightbox] = createSignal(null);

  const goTo = (i) =>
    document.getElementById(parks[i].slug)?.scrollIntoView({ behavior: "smooth" });

  onMount(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      // Track which park board is in view.
      gsap.utils.toArray(".board").forEach((el) => {
        const i = Number(el.dataset.index);
        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) {
              setActive(i);
              setProgress(i);
            }
          },
        });
        if (!reduce) {
          gsap.to(el.querySelector(".board-texture"), {
            yPercent: -8,
            ease: "none",
            scrollTrigger: { trigger: el, scrub: true },
          });
          gsap.utils.toArray(".parallax-fast", el).forEach((s) =>
            gsap.fromTo(s, { y: 120 }, { y: -120, ease: "none", scrollTrigger: { trigger: el, scrub: true } })
          );
        }
      });

      // Drive between parks: map takes center stage and the van moves.
      gsap.utils.toArray(".drive").forEach((el) => {
        const i = Number(el.dataset.index);
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => setProgress(i + self.progress),
          onToggle: (self) => {
            setMapCentered(self.isActive);
            if (self.isActive) setActive(-1);
          },
        });
      });

      // Photos drop in and get pinned.
      if (!reduce) {
        gsap.set(".pin-item", { opacity: 0, y: -60, rotation: (_, el) => (parseFloat(el.style.getPropertyValue("--rot")) || 0) + 14, scale: 1.08 });
        ScrollTrigger.batch(".pin-item", {
          start: "top 90%",
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              rotation: (_, el) => parseFloat(el.style.getPropertyValue("--rot")) || 0,
              duration: 0.7,
              ease: "back.out(1.6)",
              stagger: 0.08,
            }),
        });
      }
    });
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    onCleanup(() => {
      ctx.revert();
      window.removeEventListener("keydown", onKey);
    });
  });

  return (
    <>
      <aside class="sidebar" classList={{ hidden: mapCentered() || active() < 0 }}>
        <RouteMap progress={progress()} active={active()} onSelect={goTo} />
        <nav class="chips">
          <For each={parks}>
            {(p, i) => (
              <button classList={{ active: active() === i() }} onClick={() => goTo(i())}>{p.name}</button>
            )}
          </For>
        </nav>
      </aside>

      <main>
        <section class="hero">
          <p class="eyebrow">A road trip in four parks</p>
          <h1>Canyons to Geysers</h1>
          <p class="hero-route">
            <For each={parks}>{(p, i) => <><a href={`#${p.slug}`}>{p.name}</a>{i() < parks.length - 1 && <span> → </span>}</>}</For>
          </p>
          <span class="scroll-hint">scroll ↓</span>
        </section>

        <For each={parks}>
          {(p, i) => (
            <>
              <Board park={p} index={i()} onOpen={setLightbox} />
              <Show when={i() < parks.length - 1}>
                <section class="drive" data-index={i()}>
                  <div class="drive-sticky">
                    <p class="drive-label">
                      {p.name} <span>→</span> {parks[i() + 1].name}
                    </p>
                    <RouteMap large progress={progress()} active={-1} onSelect={goTo} />
                  </div>
                </section>
              </Show>
            </>
          )}
        </For>

        <section class="outro">
          <h2>~1,000 miles later</h2>
          <p>Thanks for riding along.</p>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to the start ↑</a>
        </section>
      </main>

      <Show when={lightbox()}>
        {(photo) => (
          <div class="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
            <figure>
              <img src={photo().src} alt={photo().caption ?? ""} />
              {photo().caption && <figcaption>{photo().caption}</figcaption>}
            </figure>
          </div>
        )}
      </Show>
    </>
  );
}
