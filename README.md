# SafeheadBABY — Redesign (static, Vercel-ready)

A brand-faithful redesign of the SafeheadBABY marketing site, built as static
HTML/CSS/JS for client review. No backend, no purchase actions.

## Run locally
From this folder:

    python -m http.server 3000

Then open http://localhost:3000

## Deploy to Vercel
This folder is deploy-ready. Either:
- Drag-and-drop the folder onto vercel.com, or
- Run `vercel` (or `vercel --prod`) from inside this folder.

No build step required — it's a static site. `vercel.json` enables clean URLs.

## Structure
- index.html, about.html, reviews.html, gallery.html, contact.html
- assets/css/styles.css   — design system (keeps the #8cc63e brand green)
- assets/js/main.js        — nav, hero carousel, gallery lightbox, reveal
- assets/img/              — real product, award, hero & gallery images

## Notes
- Content (reviews, expert quotes, awards, contact details) is pulled from the
  live site — all real, nothing invented.
- Forms are demo-only (marked in the UI); wire them up before going live.
- `features.png` / large hero PNGs can be compressed (e.g. to WebP) before launch.
