# kajolphadniswebsite

This repo is the source of truth for [www.kajolphadnis.com](https://www.kajolphadnis.com) — a consulting and career-coaching site for Kajol Phadnis (ex-Deloitte management consultant, Growthcraft founder).

## How deploys work

The repo is connected to the Vercel project `kajolphadniswebsite`. **Pushing to `main` deploys to production automatically**; pushing any other branch builds a preview deployment. Do not use `vercel --prod` CLI deploys — they bypass this repo and the two will drift apart (that's exactly how this repo ended up empty for the site's first month).

## What this is

A static HTML/CSS/JS site — no build system, framework, or templating engine. Shared markup (nav, footer) is duplicated across pages rather than componentized.

- 29 pages: the homepage (`index.html`) plus 28 other routes, matching `sitemap.xml`.
- Clean URLs: `/consulting` serves `consulting.html`, `/insights/mbb-vs-big-4` serves `insights/mbb-vs-big-4.html`, etc. — configured via `vercel.json` (`cleanUrls: true`).
- Analytics: GA4 (`G-4LRWS1GXM9`) loaded directly via gtag.js on every page, plus a Google Tag Manager container (`GTM-TWP7R8LZ`) installed alongside it (currently empty — no tags configured inside GTM yet). Conversion events fired from inline JS: `generate_lead` (contact form), `sign_up` (newsletter + both quiz email captures), `quiz_start` / `quiz_complete` (both diagnostics, with `quiz_name` and `quiz_result` parameters).

## History

The site originally shipped straight from the Vercel CLI with no git history. On **2026-08-08** the source was reconstructed from the live deployment into this repo (see `MISSING_ASSETS.md` for how images were handled), the repo's git integration took over production deploys, and analytics/SEO improvements were layered on top. See the commit log from `e2058e2` onward for the full trail.
