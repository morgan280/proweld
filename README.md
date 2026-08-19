# ProWeld One — Concept Site

A concept redesign of [proweldone.com](https://www.proweldone.com/) built to pitch. Static HTML/CSS/JS — no build step, no dependencies. Design system: **"Carbon & Arc"** (carbon-dark shop, TIG-arc blue + molten amber, fixture-table dot grid, mono spec labels).

## Run it

```bash
python3 -m http.server 4174 --directory "/Users/admin/Book Project/proweld-one"
```

Then open http://localhost:4174 (or use the `proweld` preview config in `.claude/launch.json`).

## Pages

| Page | What's on it |
|---|---|
| `index.html` | Spark-simulation hero (video-ready), stats, "Quality is Everything," capability cards, **PRINT → PART drag slider**, process, industries ticker, work teaser, merch band, CTA |
| `capabilities.html` | All 6 services with spec-sheet tables |
| `work.html` | Portfolio grid with drop-in photo slots |
| `about.html` | Story, shop rules, equipment list, merch band |
| `contact.html` | RFQ form with file-drop (demo → opens pre-filled email) |

## Drop-in assets (no code edits needed)

- **Hero video** → save as `assets/hero.mp4`. The hero detects it and fades it in over the photo automatically. Specs: 1920×1080, 8–20s seamless loop, H.264, muted, ideally under 12 MB.
- **Work photos** → save as `assets/work/pw-01.jpg` … `pw-07.jpg`. Each slot uses your local file first, falls back to a photo from the current live site, then to a styled "drop photo here" placeholder.

### Suggested gen-AI video prompt (OpenRouter / any video model)

> Slow-motion close-up of TIG welding in a dark fabrication shop, electric blue arc light flickering, orange sparks drifting and bouncing on a steel fixture table with a grid of round holes, shallow depth of field, cinematic, moody, dark background, seamless loop, no text, no faces.

Generate 2–3 variations, pick the one that loops cleanest, drop it in as `assets/hero.mp4`.

## Placeholders to confirm with the shop before showing as "final"

Everything marked `*` on the site:

- Stats band: ±0.005" tolerance, 48-hr quote turnaround
- Materials list (chromoly? titanium? inconel?)
- Equipment list on About (exact laser, brake, CNC machines)
- Industries ticker (aerospace/medical/defense are placeholders — use their real customer verticals)
- Weld standards (AWS D1.1 reference on capabilities + blueprint)
- Response-time promise on Contact

Images are currently **hotlinked from the live site's Wix CDN** (their own photos) — fine for a concept demo, but self-host them before production.

## Production punch-list (when the client says yes)

1. Real RFQ backend — Formspree/Netlify Forms/custom endpoint so drawings land in the shop inbox (mailto is demo-only)
2. Self-host images + video, add real project photos from @proweld_one Instagram
3. Case studies: 2–3 projects as problem → build → result
4. Reviews: pull Yelp/Google review quotes into the site
5. Local SEO: LocalBusiness schema, service-area pages, Google Business profile link-up
6. Optional: embed the PartView 3D viewer so buyers can spin an actual machined part
7. Analytics + a phone-tap goal (most fab-shop leads call)

---
Concept by BrandOwl Creative · built 2026-08-18
