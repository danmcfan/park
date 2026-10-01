// The curate page: a grid of everything in the dump, and a viewer for
// captions and video clip points. Every change saves straight to the server.
import type { Choice, Item } from "./types";

type Park = { slug: string; name: string };

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...kids: (Node | string)[]) {
  const e: HTMLElementTagNameMap[K] = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
}

let items: Item[] = [];
let parks: Park[] = [];
let shown: Item[] = [];
let open = -1; // index into `shown` of the item in the viewer

const parkOf = (i: Item) => i.park ?? i.suggestedPark;
const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
const clip = (i: Item) => ({ start: i.start ?? 0, end: i.end ?? i.duration ?? 0 });

// ---------- Saving ----------

const timers = new Map<string, number>();
const pending = new Map<string, Choice>();
function update(item: Item, patch: Choice, delay = 0) {
  Object.assign(item, patch);
  for (const k of Object.keys(patch) as (keyof Choice)[]) if (patch[k] === undefined) delete item[k];
  pending.set(item.id, { ...pending.get(item.id), ...nullify(patch) });
  clearTimeout(timers.get(item.id));
  timers.set(item.id, window.setTimeout(() => flush(item.id), delay));
  refreshCard(item);
  counts();
}
// JSON drops undefined, so clear fields with null.
const nullify = (p: Choice) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? null])) as Choice;
async function flush(id: string) {
  const patch = pending.get(id);
  pending.delete(id);
  if (patch) await fetch(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}
const flushAll = () => Promise.all([...pending.keys()].map((id) => (clearTimeout(timers.get(id)), flush(id))));

// ---------- Grid ----------

function parkSelect(item: Item) {
  const s = el("select");
  s.append(el("option", { value: "", textContent: "— no park —" }));
  for (const p of parks)
    s.append(el("option", { value: p.slug, textContent: p.name + (p.slug === item.suggestedPark ? " (GPS)" : "") }));
  s.value = parkOf(item) ?? "";
  s.onchange = () => update(item, { park: s.value || undefined });
  return s;
}

const cards = new Map<string, HTMLElement>();
function card(item: Item, index: number) {
  const badge = item.type === "video" ? el("span", { className: "badge" }) : "";
  const thumb = el("div", { className: "thumb", onclick: () => show(index) },
    el("img", { src: `/thumb/${item.id}`, loading: "lazy", alt: "" }), badge);
  const include = el("input", { type: "checkbox", checked: !!item.include, onchange: () => update(item, { include: include.checked || undefined }) });
  const caption = el("input", { type: "text", placeholder: "Caption", value: item.caption ?? "" });
  caption.oninput = () => update(item, { caption: caption.value || undefined }, 400);
  const c = el("div", { className: "card" }, thumb,
    el("div", { className: "fields" },
      el("label", { className: "row" }, include, "Include", el("span", { className: "spacer" })),
      parkSelect(item),
      caption,
      el("div", { className: "name", title: item.path, textContent: item.path })));
  cards.set(item.id, c);
  refreshCard(item);
  return c;
}

function refreshCard(item: Item) {
  const c = cards.get(item.id);
  if (!c) return;
  c.classList.toggle("in", !!item.include);
  (c.querySelector("input[type=checkbox]") as HTMLInputElement).checked = !!item.include;
  const cap = c.querySelector("input[type=text]") as HTMLInputElement;
  if (document.activeElement !== cap) cap.value = item.caption ?? "";
  (c.querySelector("select") as HTMLSelectElement).value = parkOf(item) ?? "";
  const badge = c.querySelector(".badge");
  if (badge && item.duration) {
    const { start, end } = clip(item);
    const trimmed = start > 0 || end < item.duration;
    badge.textContent = trimmed ? `✂ ${fmt(start)}–${fmt(end)}` : fmt(item.duration);
  }
}

function render() {
  const inc = $<HTMLSelectElement>("f-include").value;
  const park = $<HTMLSelectElement>("f-park").value;
  const type = $<HTMLSelectElement>("f-type").value;
  const live = $<HTMLInputElement>("f-live").checked;
  shown = items.filter(
    (i) =>
      (live || !i.live) &&
      (inc === "all" || (inc === "in") === !!i.include) &&
      (park === "all" || (park === "none" ? !parkOf(i) : parkOf(i) === park)) &&
      (type === "all" || i.type === type),
  );
  cards.clear();
  $("grid").replaceChildren(...shown.map(card));
  counts();
}

function counts() {
  const inc = items.filter((i) => i.include);
  const per = parks.map((p) => `${p.name} ${inc.filter((i) => parkOf(i) === p.slug).length}`).join(" · ");
  $("counts").textContent = `${shown.length} shown of ${items.length} · ${inc.length} included (${per})`;
}

// ---------- Viewer ----------

const video = () => $("media").querySelector("video");

function show(index: number) {
  if (index < 0 || index >= shown.length) return;
  open = index;
  const item = shown[index];
  $("viewer").hidden = false;
  $("v-name").textContent = item.path;
  $<HTMLInputElement>("v-include").checked = !!item.include;
  $("v-park").replaceWith(Object.assign(parkSelect(item), { id: "v-park" }));
  $<HTMLTextAreaElement>("v-caption").value = item.caption ?? "";
  const meta = [
    item.taken?.replace("T", " "),
    item.width && `${item.width}×${item.height}`,
    item.lat !== undefined ? `GPS ${item.lat.toFixed(4)}, ${item.lon!.toFixed(4)}` : "no GPS",
    item.live && "Live Photo clip",
    item.width && item.height && Math.abs(Math.max(item.width, item.height) / Math.min(item.width, item.height) - (item.type === "image" ? 4 / 3 : 16 / 9)) > 0.02
      ? `⚠ not ${item.type === "image" ? "4:3" : "16:9"}: export crops the middle`
      : "",
  ];
  $("v-meta").textContent = meta.filter(Boolean).join("\n");

  if (item.type === "image") {
    $("media").replaceChildren(el("img", { src: `/large/${item.id}`, alt: "" }));
    $("v-video").hidden = $("clipbar").hidden = true;
  } else {
    const v = el("video", { src: `/proxy/${item.id}`, controls: true, autoplay: true, muted: true, playsInline: true });
    v.ontimeupdate = () => {
      const { start, end } = clip(item);
      if (looping && v.currentTime >= end) v.currentTime = start;
      drawClip();
    };
    // The first open of a video makes its preview copy, which takes a few seconds.
    const wait = el("p", { className: "meta", textContent: "Making a preview…" });
    v.onloadeddata = () => wait.remove();
    $("media").replaceChildren(v, wait);
    $("v-video").hidden = $("clipbar").hidden = false;
    looping = false;
    drawClip();
  }
}

let looping = false;
function drawClip() {
  const item = shown[open];
  if (!item || item.type !== "video" || !item.duration) return;
  const { start, end } = clip(item);
  const pct = (t: number) => `${(t / item.duration!) * 100}%`;
  Object.assign($("clip").style, { left: pct(start), width: pct(end - start) });
  $("poster-mark").style.left = pct(item.poster ?? start);
  $("playhead").style.left = pct(video()?.currentTime ?? 0);
  $<HTMLInputElement>("v-start").value = start.toFixed(1);
  $<HTMLInputElement>("v-end").value = end.toFixed(1);
  $<HTMLInputElement>("v-poster").value = (item.poster ?? start).toFixed(1);
  $("v-length").textContent = `${(end - start).toFixed(1)} s of ${item.duration.toFixed(1)} s`;
}

function setPoint(which: "start" | "end" | "poster", t: number) {
  const item = shown[open];
  t = Math.round(Math.min(Math.max(t, 0), item.duration ?? t) * 10) / 10;
  const { start, end } = clip(item);
  if (which === "start" && t >= end) return;
  if (which === "end" && t <= start) return;
  update(item, { [which]: t });
  drawClip();
}

function close() {
  $("viewer").hidden = true;
  $("media").replaceChildren();
  open = -1;
  flushAll();
}

// ---------- Wiring ----------

$("prev").onclick = () => show(open - 1);
$("next").onclick = () => show(open + 1);
$("close").onclick = close;
$<HTMLInputElement>("v-include").onchange = (e) => update(shown[open], { include: (e.target as HTMLInputElement).checked || undefined });
$<HTMLTextAreaElement>("v-caption").oninput = (e) => update(shown[open], { caption: (e.target as HTMLTextAreaElement).value || undefined }, 400);
for (const w of ["start", "end", "poster"] as const) {
  $<HTMLInputElement>(`v-${w}`).onchange = (e) => setPoint(w, Number((e.target as HTMLInputElement).value));
  (document.querySelector(`[data-set=${w}]`) as HTMLButtonElement).onclick = () => setPoint(w, video()?.currentTime ?? 0);
}
const playClip = () => {
  const v = video();
  if (!v) return;
  looping = true;
  v.currentTime = clip(shown[open]).start;
  v.play();
};
$("play-clip").onclick = playClip;
$("clear-clip").onclick = () => {
  update(shown[open], { start: undefined, end: undefined });
  drawClip();
};
$("clipbar").onclick = (e) => {
  const v = video();
  const item = shown[open];
  if (!v || !item.duration) return;
  const r = $("clipbar").getBoundingClientRect();
  looping = false;
  v.currentTime = ((e.clientX - r.left) / r.width) * item.duration;
};

document.addEventListener("keydown", (e) => {
  if ($("viewer").hidden) return;
  const typing = (e.target as HTMLElement).matches("input[type=text], input[type=number], textarea");
  if (e.key === "Escape") return typing ? (e.target as HTMLElement).blur() : close();
  if (typing || e.metaKey || e.ctrlKey) return;
  const item = shown[open];
  const v = video();
  const k = e.key.toLowerCase();
  if (k === "arrowleft") show(open - 1);
  else if (k === "arrowright") show(open + 1);
  else if (k === "x") {
    update(item, { include: !item.include || undefined });
    $<HTMLInputElement>("v-include").checked = !!item.include;
  } else if (v && k === "i") setPoint("start", v.currentTime);
  else if (v && k === "o") setPoint("end", v.currentTime);
  else if (v && k === "p") setPoint("poster", v.currentTime);
  else if (v && k === "c") playClip();
  else if (v && k === " ") v.paused ? v.play() : v.pause();
  else return;
  e.preventDefault();
});

for (const id of ["f-include", "f-park", "f-type", "f-live"]) $(id).onchange = render;

$("rescan").onclick = async () => {
  await flushAll();
  $<HTMLButtonElement>("rescan").disabled = true;
  items = (await (await fetch("/api/rescan", { method: "POST" })).json()).items;
  $<HTMLButtonElement>("rescan").disabled = false;
  render();
};

$("export").onclick = async () => {
  const btn = $<HTMLButtonElement>("export");
  btn.disabled = true;
  await flushAll();
  const log = $("log");
  log.hidden = false;
  log.textContent = "";
  const res = await fetch("/api/export", { method: "POST" });
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    log.textContent += value;
    log.scrollTop = log.scrollHeight;
  }
  btn.disabled = false;
};

window.addEventListener("beforeunload", () => void flushAll());

const data = await (await fetch("/api/items")).json();
items = data.items;
parks = data.parks;
const fp = $<HTMLSelectElement>("f-park");
fp.append(el("option", { value: "all", textContent: "all" }), el("option", { value: "none", textContent: "no park" }));
for (const p of parks) fp.append(el("option", { value: p.slug, textContent: p.name }));
document.title = `Curate · ${data.dump.split("/").pop()}`;
render();
