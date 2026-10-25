#!/usr/bin/env python3
"""Write the reviews in data/reviews.json into the site as plain HTML and schema.

Reviews live in the page source, not behind JavaScript, so Google and AI crawlers
(GPTBot, ClaudeBot, PerplexityBot — most of which don't run scripts) can read them.

    python3 scripts/build_reviews.py

Updates, for each product:
  - the block between <!-- reviews:start --> and <!-- reviews:end --> in each page
  - aggregateRating + review on the Product JSON-LD of the product page
  - the "Rated ..." sentence on the product's line in llms.txt
"""
import html, json, re, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PRODUCTS = {
    "promotion-case-template": {
        "pages": [("promotion-case-template.html", "h2"), ("toolkit.html", "h3")],
        "schema_page": "promotion-case-template.html",
        "llms_anchor": "£9.99, instant download, 14-day money-back guarantee.",
        "empty": "No reviews yet. If you've used it, I'd love to hear how it went, "
                 "and your review will help the next person decide.",
    },
}


def stars(n):
    return "★" * round(n) + "☆" * (5 - round(n))


def nice_date(d):
    return date.fromisoformat(d).strftime("%-d %B %Y")


def block(reviews, heading, empty):
    e = lambda s: html.escape(s, quote=False)
    out = [f'<{heading} class="rv-h">Customer reviews</{heading}>']
    if reviews:
        avg = sum(r["rating"] for r in reviews) / len(reviews)
        n = len(reviews)
        out.append(f'<p class="rv-summary"><span class="rv-stars" aria-hidden="true">{stars(avg)}</span> '
                   f'<strong>Rated {avg:.1f} out of 5</strong> from {n} review{"s" if n > 1 else ""}</p>')
        out.append('<ul class="rv-list">')
        for r in sorted(reviews, key=lambda r: r["date"], reverse=True):
            by = e(r["name"]) + (f' · {e(r["role"])}' if r.get("role") else "")
            ver = '<span class="rv-ver">Verified buyer</span>' if r.get("verified") else ""
            out.append(
                f'<li class="rv-item"><div class="rv-top"><span class="rv-stars" role="img" '
                f'aria-label="{r["rating"]} out of 5 stars">{stars(r["rating"])}</span>{ver}</div>'
                f'<blockquote class="rv-text">{e(r["text"])}</blockquote>'
                f'<p class="rv-by">{by} · <time datetime="{r["date"]}">{nice_date(r["date"])}</time></p></li>')
        out.append('</ul>')
    else:
        out.append(f'<p class="rv-empty">{html.escape(empty, quote=False)}</p>')
    out.append('<div class="rv-form-slot" id="write-review"></div>')
    return "\n".join(out)


def replace_block(text, key, new):
    pat = re.compile(r'(<div[^>]*data-reviews="%s"[^>]*>)\s*<!-- reviews:start -->.*?<!-- reviews:end -->'
                     % re.escape(key), re.S)
    if not pat.search(text):
        sys.exit(f"No reviews block for {key}")
    return pat.sub(lambda m: f"{m.group(1)}<!-- reviews:start -->\n{new}\n<!-- reviews:end -->", text, count=1)


def update_schema(text, reviews):
    m = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', text, re.S)
    data = json.loads(m.group(2))
    nodes = data.get("@graph", [data]) if isinstance(data, dict) else data
    product = next(n for n in nodes if n.get("@type") == "Product")
    product.pop("aggregateRating", None)
    product.pop("review", None)
    if reviews:  # never emit a rating with no reviews behind it
        product["aggregateRating"] = {
            "@type": "AggregateRating",
            "ratingValue": f"{sum(r['rating'] for r in reviews) / len(reviews):.1f}",
            "reviewCount": len(reviews), "bestRating": "5", "worstRating": "1"}
        product["review"] = [{
            "@type": "Review",
            "author": {"@type": "Person", "name": r["name"]},
            "datePublished": r["date"],
            "reviewBody": r["text"],
            "reviewRating": {"@type": "Rating", "ratingValue": str(r["rating"]), "bestRating": "5", "worstRating": "1"},
        } for r in sorted(reviews, key=lambda r: r["date"], reverse=True)]
    body = "\n" + json.dumps(data, indent=1, ensure_ascii=False) + "\n"
    return text[:m.start(2)] + body + text[m.end(2):]


def update_llms(text, anchor, reviews):
    text = re.sub(re.escape(anchor) + r"( Rated [0-9.]+/5 from \d+ buyer reviews?\.)?", anchor, text)
    if reviews:
        avg = sum(r["rating"] for r in reviews) / len(reviews)
        n = len(reviews)
        text = text.replace(anchor, f"{anchor} Rated {avg:.1f}/5 from {n} buyer review{'s' if n > 1 else ''}.", 1)
    return text


def main():
    data = json.loads((ROOT / "data/reviews.json").read_text())
    llms = (ROOT / "llms.txt").read_text()
    for key, cfg in PRODUCTS.items():
        reviews = data.get(key, [])
        for r in reviews:
            assert 1 <= r["rating"] <= 5 and r["name"] and r["text"] and date.fromisoformat(r["date"]), r
        for page, heading in cfg["pages"]:
            p = ROOT / page
            t = replace_block(p.read_text(), key, block(reviews, heading, cfg["empty"]))
            if page == cfg["schema_page"]:
                t = update_schema(t, reviews)
            p.write_text(t)
        llms = update_llms(llms, cfg["llms_anchor"], reviews)
        print(f"{key}: {len(reviews)} review(s) written")
    (ROOT / "llms.txt").write_text(llms)


if __name__ == "__main__":
    main()
