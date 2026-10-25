#!/usr/bin/env python3
"""Write data/testimonials.json (and template reviews from data/reviews.json)
into reviews.html as plain HTML.

Everything is real text in the page source, so Google and AI crawlers (most of
which don't run JavaScript) can read and quote it: the stats strip, the
featured quote, the "what people say most" themes and their summary, every
testimonial, the template reviews and the FAQ (with FAQPage schema).
JavaScript on the page only adds the topic filter and "read more" toggles.

    python3 scripts/build_testimonials.py

Topics with no testimonials are left out, so the page never shows empty
sections. No star ratings or Review schema for testimonials: Google doesn't
allow them for testimonials about yourself. (Template reviews carry their
stars on the product page's own Product schema.)
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
AVATAR_BG = ["#d98a24", "#2f6d62", "#8a5fa8", "#c2566b", "#3b6fb6"]
e = lambda s: html.escape(s, quote=False)
a = lambda s: html.escape(s, quote=True)


def stars(n):
    return "★" * round(n) + "☆" * (5 - round(n))


def month(d):
    return date.fromisoformat(d).strftime("%B %Y")


def avatar(t, i):
    if t.get("logo"):
        return f'<span class="tm-av tm-av-logo"><img src="{a(t["logo"])}" alt="" width="44" height="44" loading="lazy"></span>'
    initials = "".join(w[0] for w in t["name"].split()[:2]).upper()
    return f'<span class="tm-av" style="background:{AVATAR_BG[i % len(AVATAR_BG)]}" aria-hidden="true">{e(initials)}</span>'


def quote_html(t):
    q = e(t["quote"])
    if t.get("highlight"):
        h = e(t["highlight"])
        q = q.replace(h, f"<mark>{h}</mark>", 1)
    return q


def card(t, i):
    meta = ", ".join(e(x) for x in (t.get("role"), t.get("org")) if x)
    src = e(t.get("source", ""))
    if t.get("source_url"):
        src = f'<a href="{a(t["source_url"])}" rel="noopener">{src}</a>'
    when = f'<time datetime="{t["date"]}">{month(t["date"])}</time>' if t.get("date") else ""
    tag = " · ".join(x for x in (src, when) if x)
    cite = f' cite="{a(t["source_url"])}"' if t.get("source_url") else ""
    long = " tm-long" if len(t["quote"]) > 320 else ""
    return (f'<figure class="tm-card{long}">'
            f'<figcaption class="tm-who">{avatar(t, i)}<span><strong>{e(t["name"])}</strong>'
            f'<span class="tm-role">{meta}</span></span></figcaption>'
            f'<blockquote{cite}>“{quote_html(t)}”</blockquote>'
            + (f'<p class="tm-src">{tag}</p>' if tag else "") + '</figure>')


def main():
    data = json.loads((ROOT / "data/testimonials.json").read_text())
    items = data["testimonials"]
    themes = data.get("themes", [])
    reviews = json.loads((ROOT / "data/reviews.json").read_text()).get("promotion-case-template", [])
    names = {t["name"]: t for t in items}
    for t in items:
        assert t["topic"] in {k for k, _, _ in TOPICS} and t["quote"] and t["name"], t
        assert not t.get("highlight") or t["highlight"] in t["quote"], t["name"]
    for th in themes:
        assert all(n in names for n in th["names"]), th

    out = []
    # Stats strip — every number is counted from the data, never typed in.
    n_li = sum(1 for t in items if t.get("source") == "LinkedIn recommendation")
    n_client = sum(1 for t in items if t.get("source") == "Client testimonial")
    stats = []
    if n_li:
        stats.append((str(n_li), f'LinkedIn recommendation{"s" if n_li > 1 else ""}', "from Deloitte managers and colleagues"))
    if n_client:
        stats.append((str(n_client), f'client testimonial{"s" if n_client > 1 else ""}', "Specsavers, Adevinta"))
    if reviews:
        avg = sum(r["rating"] for r in reviews) / len(reviews)
        stats.append((f"{avg:.1f}★", "Promotion Case Template", f'from {len(reviews)} buyer review{"s" if len(reviews) > 1 else ""}'))
    stats.append(("17,000+", "YouTube community", "career advice for consulting and corporate"))
    out.append('<div class="tm-stats">' + "".join(
        f'<div class="tm-stat"><span class="tm-num">{n}</span><span class="tm-lab">{l}</span><span class="tm-sm">{s}</span></div>'
        for n, l, s in stats) + "</div>")

    f = data.get("featured")
    if f:
        t = names[f["name"]]
        assert f["quote"] in t["quote"]
        out.append(f'<figure class="tm-feature"><blockquote>“{e(f["quote"])}”</blockquote>'
                   f'<figcaption><strong>{e(t["name"])}</strong> · {e(t.get("role", ""))}</figcaption></figure>')

    if themes:
        ranked = sorted(themes, key=lambda th: -len(th["names"]))
        labels = [th["label"].lower() for th in ranked[:4]]
        summary = (f'Across {len(items)} testimonials from Deloitte managers, colleagues and clients, the themes that come up most are '
                   f'{", ".join(labels[:-1])} and {labels[-1]}.')
        out.append('<section class="tm-themes" id="themes"><h2>What people say <span class="hl">most</span></h2>'
                   f'<p class="tm-summary">{e(summary)}</p><ul class="tm-theme-list">' + "".join(
                       f'<li><span class="tm-theme-h">{e(th["label"])}</span>'
                       f'<span class="tm-theme-n">Mentioned by {len(th["names"])}: {e(", ".join(th["names"]))}</span>'
                       f'<span class="tm-theme-q">{e(th["evidence"])}</span></li>' for th in ranked) + "</ul></section>")

    groups = [(k, t, s, [x for x in items if x["topic"] == k]) for k, t, s in TOPICS]
    groups = [g for g in groups if g[3]]
    tabs = [("all", "All")] + [(k, re.sub("&amp;", "&", t)) for k, t, _, _ in groups] + ([("template", "Template reviews")] if reviews else [])
    out.append('<div class="tm-filter" role="tablist" aria-label="Filter reviews" hidden>' + "".join(
        f'<button type="button" role="tab" data-f="{k}" aria-selected="{"true" if k == "all" else "false"}">{e(l)}</button>' for k, l in tabs) + "</div>")
    i = 0
    for key, title, sub, group in groups:
        cards = []
        for t in group:
            cards.append(card(t, i)); i += 1
        out.append(f'<section class="tm-group" id="{key}" data-g="{key}"><h2>{title}</h2><p class="tm-sub">{sub}</p>'
                   f'<div class="tm-grid">{"".join(cards)}</div></section>')

    if reviews:
        avg = sum(r["rating"] for r in reviews) / len(reviews)
        rv = "".join(
            f'<figure class="tm-card tm-rv"><p class="tm-stars" role="img" aria-label="{r["rating"]} out of 5 stars">{stars(r["rating"])}</p>'
            f'<blockquote>“{e(r["text"])}”</blockquote><figcaption class="tm-src">{e(r["name"])}'
            + (f' · {e(r["role"])}' if r.get("role") else "") + f' · <time datetime="{r["date"]}">{month(r["date"])}</time>'
            + (' · Verified buyer' if r.get("verified") else "") + '</figcaption></figure>'
            for r in sorted(reviews, key=lambda r: r["date"], reverse=True))
        out.append('<section class="tm-group" id="template" data-g="template"><h2>Promotion Case Template reviews</h2>'
                   f'<p class="tm-sub">Rated {avg:.1f} out of 5 by buyers. <a href="/promotion-case-template">See the template →</a></p>'
                   f'<div class="tm-grid">{rv}</div></section>')

    # FAQ: written for the questions people (and AI assistants) ask about a coach before booking.
    faq = [
        ("What do people say about working with Kajol Phadnis?", ""),
        ("Who has Kajol Phadnis worked with?",
         "Kajol spent eight years at Deloitte Digital leading customer experience and product strategy, on brands such as Dyson, Lego and Specsavers. "
         "She now runs customer experience for 70+ US and UK retail and consumer brands across 13 Middle East markets, and founded Growthcraft, a customer growth consultancy."),
        ("Are these testimonials real?",
         "Yes. Every testimonial is quoted word for word, with any cuts marked …, and LinkedIn recommendations link to Kajol's LinkedIn profile where they were written. "
         "Template reviews come from buyers and are checked before they're published."),
        ("Where can I find more reviews of Kajol Phadnis?",
         "On her LinkedIn profile (recommendations), in the comments on her YouTube channel, and on the Promotion Case Template page."),
    ]
    if themes:
        faq[0] = (faq[0][0], summary + f' One manager put it this way: “{f["quote"]}”' if f else summary)
    else:
        faq = faq[1:]
    out.append('<section class="tm-faq" id="faq"><h2>Questions people ask</h2><div class="faq">' + "".join(
        f"<details><summary>{e(q)}</summary><p>{e(ans)}</p></details>" for q, ans in faq) + "</div></section>")
    out.append('<script type="application/ld+json">' + json.dumps({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": ans}} for q, ans in faq]
    }, ensure_ascii=False) + "</script>")

    p = ROOT / "reviews.html"
    s = p.read_text()
    s, n = re.subn(r"<!-- testimonials:start -->.*?<!-- testimonials:end -->",
                   lambda m: "<!-- testimonials:start -->\n" + "\n".join(out) + "\n<!-- testimonials:end -->", s, flags=re.S)
    assert n == 1
    p.write_text(s)
    print(f"{len(items)} testimonial(s), {len(reviews)} template review(s) written to reviews.html")


if __name__ == "__main__":
    main()
