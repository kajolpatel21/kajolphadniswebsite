# kajolphadniswebsite

This repo mirrors the live site at [www.kajolphadnis.com](https://www.kajolphadnis.com) — a consulting and career-coaching site for Kajol Phadnis (ex-Deloitte management consultant, Growthcraft founder).

## Why this repo exists

Every previous deploy of this site was pushed straight from the Vercel CLI (`vercel --prod`), bypassing git entirely — which is why this repository had zero commits despite the site being fully built and live in production. This commit reconstructs the site's source from the live Vercel deployment (fetched via the `kajolphadniswebsite.vercel.app` alias) on **2026-08-08**, so the project can move onto proper git-based deploys going forward.

## What this is (and isn't)

This is a **best-effort static HTML/CSS/JS mirror**, not necessarily byte-identical to whatever originally produced the live site. No build system, framework, or templating engine was involved in reconstructing it — each page was hand-fetched from the live deployment and saved as a standalone `.html` file. Shared markup (nav, footer, styles) is duplicated across pages rather than componentized, because that's how the live HTML actually renders.

- 29 pages total: the homepage (`index.html`) plus 28 other routes, matching the live `sitemap.xml`.
- Clean URLs: `/consulting` serves `consulting.html`, `/insights/mbb-vs-big-4` serves `insights/mbb-vs-big-4.html`, etc. — configured via `vercel.json` (`cleanUrls: true`).
- `styles.css`, `robots.txt`, and `sitemap.xml` are fetched/copied verbatim from production.

## Known gap: missing images

**Binary assets (images) could not be migrated** — the fetch tool used to pull pages corrupts binary content, so every `.jpg`/`.png` the site references (headshot, OG image, testimonial logos) is currently a broken link. See [`MISSING_ASSETS.md`](./MISSING_ASSETS.md) for the full list, where each file needs to live, and how to source them.

## Connecting this repo to Vercel (manual, human step)

This repo is not yet wired up to the live Vercel project. To do that:

1. In the Vercel dashboard, go to the project → **Settings → Git → Connect Repository**, and point it at this repo.
2. Push a branch and let Vercel build a **preview deployment** first — do **not** promote straight to production.
3. Verify the preview against the live site, paying particular attention to the missing images above (they'll still be broken in preview until sourced) and anything else that may not have survived the hand-fetch process losslessly.
4. Only promote to production once you're satisfied the preview matches, and once the missing assets are resolved.

This connection step needs a human with access to the Vercel project settings — it isn't something that can be done from this repo alone.
