# Park Road Trip Site

Static GitHub Pages site showcasing photos/videos from a national park road trip:
**Zion → Bryce Canyon → Grand Teton → Yellowstone**.

Status: planning only — nothing built yet. Read these before working:

- `docs/PROJECT_SCOPE.md` — goals, hosting, media pipeline, open questions
- `docs/DESIGN.md` — visual concept (corkboard / magnets / scroll animations)

Conventions (proposed, confirm with the user before deviating):
- Plain HTML/CSS/JS, no build step required to serve (GitHub Pages from `main` or `/docs`-free root).
- Optimized media only in the repo (`media/<park>/`); originals never committed.
- Keep individual files < 25 MB, repo total well under 1 GB.
