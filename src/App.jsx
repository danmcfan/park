import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { parks, legs } from "./data/parks";
import RouteMap from "./components/RouteMap";
import Board from "./components/Board";
import Photo from "./components/Photo";
import Icon from "./components/Icon";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [progress, setProgress] = createSignal(0);
  const [active, setActive] = createSignal(-1);
  const [driving, setDriving] = createSignal(false);
  const [lightbox, setLightbox] = createSignal(null);

  const goTo = (i) => document.getElementById(parks[i].slug)?.scrollIntoView({ behavior: "smooth" });

  onMount(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".park").forEach((el) => {
        const i = Number(el.dataset.index);
        ScrollTrigger.create({
          trigger: el,
          start: "top 40%",
          end: "bottom 40%",
          onToggle: (self) => {
            if (self.isActive) {
              setActive(i);
              setProgress(i);
            }
          },
        });
        if (!reduce) {
          gsap.fromTo(
            el.querySelector(".park-hero-media .photo-frame"),
            { scale: 1.12 },
            { scale: 1, ease: "none", scrollTrigger: { trigger: el.querySelector(".park-hero"), start: "top bottom", end: "bottom top", scrub: true } }
          );
        }
      });

      // Before the first park, nothing is active.
      ScrollTrigger.create({
        trigger: ".intro",
        start: "top top",
        end: "bottom 40%",
        onToggle: (self) => self.isActive && setActive(-1),
      });

      gsap.utils.toArray(".drive").forEach((el) => {
        const i = Number(el.dataset.index);
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => setProgress(i + self.progress),
          onToggle: (self) => setDriving(self.isActive),
        });
      });

      if (reduce) return;

      gsap.utils.toArray(".reveal").forEach((el) =>
        gsap.from(el, { y: 32, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } })
      );

      gsap.set(".print", { opacity: 0, y: 48, rotation: 0 });
      gsap.set(".print .magnet", { scale: 0.4, opacity: 0 });
      ScrollTrigger.batch(".print", {
        start: "top 92%",
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotation: (_, el) => parseFloat(el.style.getPropertyValue("--tilt")) || 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.07,
          });
          gsap.to(batch.map((b) => b.querySelector(".magnet")), {
            scale: 1,
            opacity: 1,
            duration: 0.45,
            ease: "back.out(2.2)",
            stagger: 0.07,
            delay: 0.45,
          });
        },
      });
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
      <header class="topbar">
        <a class="wordmark" href="#top">Canyons to Geysers</a>
        <nav class="topnav" aria-label="Parks">
          <For each={parks}>
            {(p, i) => (
              <a
                href={`#${p.slug}`}
                classList={{ active: active() === i() }}
                style={{ "--accent": p.theme.accent }}
                onClick={(e) => { e.preventDefault(); goTo(i()); }}
              >
                {p.name}
              </a>
            )}
          </For>
        </nav>
      </header>

      <aside class="rail" classList={{ away: driving() || active() < 0 }} aria-label="Route">
        <p class="rail-label">The Route</p>
        <RouteMap progress={progress()} active={active()} onSelect={goTo} />
        <ol class="rail-list">
          <For each={parks}>
            {(p, i) => (
              <li classList={{ active: active() === i() }} style={{ "--accent": p.theme.accent }}>
                <button onClick={() => goTo(i())}>
                  <span class="rail-num">{i() + 1}</span>
                  <span class="rail-name">{p.name}</span>
                  <span class="rail-dates">{p.dates}</span>
                </button>
              </li>
            )}
          </For>
        </ol>
      </aside>

      <main id="top">
        <section class="intro">
          <p class="kicker">A road trip through four national parks</p>
          <h1>Canyons to Geysers</h1>
          <p class="lede">From the red walls of southern Utah to the steaming basins of Yellowstone — twelve days, two states, and one very dusty car.</p>
          <dl class="stats">
            <div><dt>Parks</dt><dd>4</dd></div>
            <div><dt>Days</dt><dd>12</dd></div>
            <div><dt>Miles driven</dt><dd>~{legs.reduce((s, l) => s + l.miles, 0) + 300}</dd></div>
            <div><dt>States</dt><dd>2</dd></div>
          </dl>
          <ol class="park-cards">
            <For each={parks}>
              {(p, i) => (
                <li style={{ "--accent": p.theme.accent }}>
                  <a href={`#${p.slug}`} onClick={(e) => { e.preventDefault(); goTo(i()); }}>
                    <Icon name={p.icons[0]} class="park-card-icon" />
                    <span class="park-card-num">0{i() + 1}</span>
                    <span class="park-card-name">{p.name}</span>
                    <span class="park-card-meta">{p.state} · {p.dates}</span>
                  </a>
                </li>
              )}
            </For>
          </ol>
        </section>

        <For each={parks}>
          {(p, i) => (
            <>
              <Board park={p} index={i()} onOpen={(photo, park) => setLightbox({ photo, park })} />
              <Show when={i() < parks.length - 1}>
                <section class="drive" data-index={i()}>
                  <div class="drive-sticky">
                    <div class="drive-text">
                      <p class="kicker">Leg {i() + 1} of {parks.length - 1}</p>
                      <h3>{p.name} <span>to</span> {parks[i() + 1].name}</h3>
                      <p class="drive-meta">{legs[i()].miles} miles · {legs[i()].time}</p>
                    </div>
                    <RouteMap large progress={progress()} active={-1} />
                  </div>
                </section>
              </Show>
            </>
          )}
        </For>

        <footer class="outro">
          <p class="kicker">End of the road</p>
          <h2>Thanks for riding along.</h2>
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to the start</a>
        </footer>
      </main>

      <Show when={lightbox()}>
        {(lb) => (
          <div class="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={lb().photo.caption}>
            <button class="lightbox-close" aria-label="Close">×</button>
            <figure onClick={(e) => e.stopPropagation()} style={{ "--accent": lb().park.theme.accent, "--soft": lb().park.theme.soft, "--deep": lb().park.theme.deep }}>
              <Photo photo={lb().photo} eager />
              <figcaption>
                <span>{lb().park.name}</span>
                {lb().photo.caption}
              </figcaption>
            </figure>
          </div>
        )}
      </Show>
    </>
  );
}
