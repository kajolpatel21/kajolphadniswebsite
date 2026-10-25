#!/usr/bin/env python3
"""Write data/testimonials.json into reviews.html as plain HTML.

Plain text in the page source, so Google and AI crawlers (most of which don't
run JavaScript) can read and quote every testimonial.

    python3 scripts/build_testimonials.py

Topics with no testimonials are left out, so the page never shows empty sections.
No star ratings or Review schema: Google doesn't allow them for testimonials
about yourself.
"""
import html, json, re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOPICS = [
    ("promotions", "Promotions &amp; career", "From people in consulting and corporate who've used my advice to get promoted and move up."),
    ("coaching", "Coaching &amp; mentoring", "From people I've coached, mentored and managed."),
    ("consulting", "Consulting &amp; client work", "From clients and colleagues I've worked with, at Deloitte and since."),
]


def card(t):
    e = lambda s: html.escape(s, quote=False)
    who = e(t["name"])
    meta = ", ".join(e(x) for x in (t.get("role"), t.get("org")) if x)
    src = e(t.get("source", ""))
    if t.get("source_url"):
        src = f'<a href="{html.escape(t["source_url"])}" rel="noopener">{src}</a>'
    when = f' · <time datetime="{t["date"]}">{date.fromisoformat(t["date"]).strftime("%B %Y")}</time>' if t.get("date") else ""
    cite = f' cite="{html.escape(t["source_url"])}"' if t.get("source_url") else ""
    return (f'<figure class="tm-card"><blockquote{cite}>“{e(t["quote"])}”</blockquote>'
            f'<figcaption><strong>{who}</strong>{(" · " + meta) if meta else ""}'
            + (f'<span class="tm-src">{src}{when}</span>' if (src or when) else "") + '</figcaption></figure>')


def main():
    items = json.loads((ROOT / "data/testimonials.json").read_text())["testimonials"]
    for t in items:
        assert t["topic"] in {k for k, _, _ in TOPICS} and t["quote"] and t["name"], t
    out = []
    for key, title, sub in TOPICS:
        group = [t for t in items if t["topic"] == key]
        if not group:
            continue
        out.append(f'<section class="tm-group" id="{key}"><h2>{title}</h2><p class="tm-sub">{sub}</p>'
                   f'<div class="tm-grid">{"".join(card(t) for t in group)}</div></section>')
    p = ROOT / "reviews.html"
    s = p.read_text()
    s, n = re.subn(r"<!-- testimonials:start -->.*?<!-- testimonials:end -->",
                   lambda m: "<!-- testimonials:start -->\n" + "\n".join(out) + "\n<!-- testimonials:end -->", s, flags=re.S)
    assert n == 1
    p.write_text(s)
    print(f"{len(items)} testimonial(s) written to reviews.html")


if __name__ == "__main__":
    main()
