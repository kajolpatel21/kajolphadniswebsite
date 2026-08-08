# Missing binary assets

This repo was reconstructed by hand-fetching the live site's HTML/CSS/XML through a text-safe fetch tool. That tool reliably retrieves text content losslessly, but **corrupts binary files** (images) — verified by attempting to fetch `kajol.jpg`, which came back full of U+FFFD replacement characters and was unusable. As a result, no image files could be migrated into this repo. Every image the site references is a **broken link** until these are added.

## Assets to source and add

All of these are same-origin (`https://www.kajolphadnis.com/...`) and referenced from the pages below. Paths are relative to the repo root, matching where the live site serves them from.

| File | Must live at | Referenced from |
|---|---|---|
| `og-image.jpg` | `/og-image.jpg` | Every page (Open Graph / Twitter card meta tags — `og:image`, `twitter:image`, and the `image` field in several JSON-LD `Article`/`Person` schema blocks) |
| `kajol.jpg` | `/kajol.jpg` | `index.html` (homepage hero/about section, JSON-LD `Person.image`), `women-in-corporate.html` (portrait photo, JSON-LD `Article.image`) |
| `logos/specsavers.png` | `/logos/specsavers.png` | `consulting.html` (testimonial avatar), `index.html` (testimonial marquee data) |
| `logos/deloitte.jpg` | `/logos/deloitte.jpg` | `index.html` (testimonial marquee data — referenced in the JS array but not currently rendered as an `<img>`; confirm still needed) |
| `logos/adevinta.png` | `/logos/adevinta.png` | `index.html` (testimonial marquee data — same as above) |

## How to get them

Download from the Vercel dashboard: **Project → Deployments → [latest production deployment] → Source** (or `vercel pull` / a source download of the deployment), or ask the site owner (Kajol) to re-upload the original files directly into this repo at the paths above. Once added, redeploy and spot-check that Open Graph previews (e.g. via a link-preview debugger) and the pages listed above render images correctly.

## Favicon — not missing, simply doesn't exist yet

`/favicon.ico` returns **404** on the live production site (confirmed 2026-08-08). No `<link rel="icon">` tag appears in any fetched page's `<head>`. This is not a migration gap — the live site has never had a favicon. No action needed here unless the site owner wants to add one for the first time.

## Not affected

`styles.css` contains no `url(...)` image references (only CSS gradients and inline SVG data, which are text and were migrated correctly). All YouTube thumbnails (`i.ytimg.com`) and other third-party images referenced in the pages are external/hotlinked and don't need to be collected — they'll continue to load directly from YouTube once deployed.
