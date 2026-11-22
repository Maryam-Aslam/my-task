# JLR Specialist: Homepage + Range Rover Sport (design challenge)

Next.js 14 (App Router) · TypeScript · Tailwind CSS · **Three.js** · **GSAP + ScrollTrigger**

## Run
```bash
npm install
npm run dev      # http://localhost:3000  and  /models/range-rover-sport
npm run build && npm start
```
Deploy to Vercel/Netlify as a standard Next.js app (no env vars needed).

## How content works (fidelity)
`content/homepage.md` and `content/range-rover-sport.md` are the supplied files, unedited.
`lib/content.ts` parses them at build time (HTML-comment developer notes are dropped) and the pages
render **every heading, paragraph, table, list, link and price note in the supplied order**.
Design lives in components; copy lives in the .md files. To change copy, edit the .md.

## Design rationale
**Idea: "the engine as architecture."** White editorial space, a forest/emerald palette, and the hexagon as the
one recurring signature (cylinder, honeycomb, bullet, step badge).
- **Three.js hero** (`components/HexScene.tsx`): a honeycomb of hex prisms that rises in, ripples under the pointer
  (an idle sweep on touch) and tilts with scroll. The Range Rover Sport page adds two angled banks of animated
  pistons: a V engine built from the same hexagons. Pauses off-screen and when the tab is hidden, caps DPR,
  and falls back to a static hex SVG if WebGL is unavailable.
- **GSAP** (`components/Motion.tsx`): masked headline line-reveals, staggered lists and table rows, scroll-scrubbed
  connector lines on the process steps, parallax/spin on hex outlines, price highlight sweeps, magnetic CTAs,
  scroll-progress bar, hide/show header. GSAP also owns the Three.js `state` (intro, scroll, pointer easing).
- **Mobile first (35%)**: phone hero order is H1, price hooks, CTAs, quote panel, with the 3D scene as a faded
  backdrop. Wide tables become stacked, labelled rows (real `<table>` semantics kept). 44-52px touch targets,
  no horizontal scroll (verified at 390px), accordion FAQ.
- **Build standards**: one `.wrap` grid (max 1280 + shared gutters), one theme in `globals.css`/`tailwind.config.ts`,
  one H1 per page, no cards-in-cards (ruled lists + whitespace), reusable `.btn` / `.badge`.
- **Accessibility/performance**: `prefers-reduced-motion` disables all GSAP and the render loop (static frame);
  content is never hidden without JS (verified); skip link, focus rings, aria on tabs/menu.

## Demo interactions
Quote panel validates a UK registration and shows a safe "demo" confirmation. Nothing is sent. Service buttons
pre-select Rebuild / Supply & fit / Engine only (the engine-only button label changes to
"Request Current Price & Availability"). Swap `submit()` in `components/QuotePanel.tsx` for the lead API call.

## Known gaps / notes
- No workshop photography was supplied, and none is invented. The homepage trust-gallery slot is intentionally
  omitted (see content note: real photos only). Drop 3-6 verified images in and add a section after "Why Choose".
- Internal links (`/engines/...`, `/get-a-quote/` etc.) are preserved as supplied; those routes aren't part of this
  two-page brief so they 404 locally.
- `index: false` front-matter is honoured via `robots: noindex`.

## Section 2 redesign: "Choose Your … Model" (homepage)
`components/ModelShowcase.tsx` + `lib/cars.ts`. Three full-bleed "chapters" (Range Rover, Range Rover Sport,
Range Rover Velar), each with its own backdrop (light / forest / mist) and mirrored layout. Same supplied copy, rows
and links; the other 14 models stay in a compact "More models" list below.
- GSAP: clip-path "photo frame" opens on scroll, photo parallax, giant outline word drifts, one-time paintwork
  sheen, staggered chips/text. Desktop: 3D pointer-tilt + moving highlight on the photo.
- **Photos** are hotlinked from Wikimedia Commons (see `lib/cars.ts`, credit link on every photo). Check each file
  page's licence/author before launch, or replace `file` with your own press photography.
- **Video**: drop `range-rover.mp4`, `range-rover-sport.mp4` or `range-rover-velar.mp4` into `public/media/`
  and it plays automatically (muted loop) over the photo for that car.
- If a photo fails to load, a branded hex placeholder shows instead of a broken image.
