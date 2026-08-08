# Binary assets — resolved

**Status: resolved.** When this repo was first reconstructed from the live deployment (2026-08-08), no image files could be migrated — the text-safe fetch tool used for the reconstruction corrupts binary content. The five same-origin images the site references were added in follow-up commits (`9b30a96`, `5568990`) and are now present and serving in production:

| File | Lives at | Used by |
|---|---|---|
| `og-image.jpg` | `/og-image.jpg` | Every page (Open Graph / Twitter card previews, JSON-LD `image` fields) |
| `kajol.jpg` | `/kajol.jpg` | Homepage hero, `women-in-corporate` portrait, JSON-LD `Person.image` |
| `logos/specsavers.png` | `/logos/specsavers.png` | Testimonial marks (`consulting`, homepage marquee) |
| `logos/deloitte.jpg` | `/logos/deloitte.jpg` | Homepage testimonial marquee data |
| `logos/adevinta.png` | `/logos/adevinta.png` | Homepage testimonial marquee data |

One caveat worth knowing: the committed files were re-captured from the rendered live site rather than being the original source files, so they are visually faithful but re-encoded (slightly different bytes from the true originals). If pixel-perfect originals matter — most plausibly for `og-image.jpg`, which is what link previews show — replace these files with the originals whenever convenient; any push to `main` deploys automatically.

## Favicon — still doesn't exist

`/favicon.ico` returns **404** and no page has a `<link rel="icon">` tag. This has been true since before the reconstruction — the site has simply never had a favicon. Adding one (plus `apple-touch-icon`) remains an open nice-to-have.
