# Add-a-paper prompt for gpokharel.com

How to use this file: start a new chat, attach (1) the paper PDF,
(2) your current `data/projects.json` and (3) your current
`data/papers.json`, optionally (4) your current `data/news.json` and
(5) exported figure images from the paper. Then paste everything below the
line as your message. Keep this file anywhere you like; it is not part of
the website.

---

You are adding ONE new research paper to my static academic website
(gpokharel.com). The site is plain HTML/CSS/vanilla JS on GitHub Pages, with
no build step. Content is data-driven, so adding a paper requires NO code
changes — only additive content files. You will produce every artifact
yourself, in full, in this conversation. Do not modify, regenerate, or
restyle anything that already exists.

## Inputs I am providing

- The paper PDF (required).
- My current `data/projects.json` (required — you need it to avoid id
  collisions and to return a complete updated file).
- My current `data/papers.json` (required — the paper also goes on the
  Papers page, and you must return a complete updated file).
- Optionally my current `data/news.json`, and optionally pre-exported
  figure images. If a required input is missing, ask me for it before
  generating anything.

## What you will deliver

Exactly these artifacts, each as a complete file with its repository path
stated clearly:

1. `data/projects/<id>.md` — the project write-up
2. `data/projects.json` — the full updated file with the new entry added
3. `data/papers.json` — the full updated file with the new entry added
4. `assets/img/projects/<id>.png` — the thumbnail for the projects grid
5. Figure images for the write-up (extracted from the PDF if you can), or
   an explicit list of which paper figures I must export and to which paths
6. Optional: one entry for `data/news.json` announcing the paper

Choose `<id>` yourself: a short kebab-case slug from the paper's short
title (e.g. `stochastic-merit`), and confirm it does not collide with any
`id` in the projects.json I gave you.

## 1. The write-up: data/projects/<id>.md

The page template renders the title as the page `<h1>` and the metadata
from projects.json, then this Markdown below it (parsed by marked 12,
GFM). Follow these rules exactly — they are load-bearing:

- NO YAML frontmatter and NO `#` top-level heading. The file starts with
  the author block and all sections are `##` (subsections `###`), in
  sentence case.
- Open with this header block, as plain paragraphs:

      **Authors:** **Gaurab Pokharel**¹, Coauthor Name², …
      **Affiliations:** ¹Virginia Tech, ²Other University
      **Venue:** *Full venue name (VENUE YEAR)*   ← omit if preprint-only

  (Unicode superscripts ¹²³ for affiliation marks; my name bold.)
- Structure like my existing write-ups: Overview (optionally with a
  `> **Key takeaway:** …` blockquote), the method/setup, key findings,
  a short "Why this matters" section, then `## Citation` with the BibTeX
  in a ```bibtex fenced block, and finally the funding line as a small
  italic paragraph (`*This work was supported by …*`). Write an
  accessible overview in my voice, not a paper dump.
- Figures use this exact block — clean HTML, NO style attributes (the
  renderer strips them anyway; all styling comes from the site CSS):

      <figure>
        <img src="assets/img/projects/<id>/<figure-file>.png"
             alt="One-sentence literal description of the figure"
             width="700" loading="lazy" />
        <figcaption><strong>Figure N.</strong> Caption text.</figcaption>
      </figure>

  Blank lines before and after each block. Use `<strong>`/`<em>` inside
  figcaptions (Markdown is NOT parsed inside raw HTML blocks). Number
  figures sequentially with no duplicates. `width` is a hint: ~800 for
  wide multi-panel figures, ~500 for single plots.
- NO LaTeX and NO `$` anywhere — the site has no math renderer. Convert
  math to plain Unicode: subscripts K₁, K₂; Greek α, ε, κ, τ; inline
  formulas like `ε* = 2α(1 − p) / (1 − 2α)`; function-style notation like
  `T(τ, k)`.
- Section dividers `---` are allowed but MUST have a blank line both
  above and below (otherwise Markdown turns the previous line into a
  heading). Use them sparingly.
- Relative image paths only, exactly `assets/img/projects/<id>/…`. Never
  absolute paths, never external image URLs.

## 2. The metadata: data/projects.json

Return the COMPLETE updated file: my existing entries byte-for-byte
untouched, with the new entry inserted keeping the newest-first order
(by start year). New-entry conventions, matching the existing file:

    {
      "id": "<id>",
      "title": "Short project title (not necessarily the full paper title)",
      "period": "YYYY–YYYY" or "YYYY–present",
      "status": "current" (ongoing / under review / to appear)
                or "past" (published and wrapped),
      "summary": "One line, under ~110 characters, plain language.",
      "thumbnail": "assets/img/projects/<id>.png",
      "tags": ["Three", "to six", "short tags"],
      "links": [
        { "label": "Paper (VENUE YEAR)", "url": "https://…" }
      ],
      "body": "<id>"
    }

Link-label conventions: `Paper (AAAI 2024)`, `Paper (arXiv 2026)`,
`Paper (FAccT 2026, to appear)`, plus `Code` if a repository exists. Use
the arXiv or DOI landing page URL. A label containing Paper/PDF/Thesis is
what makes the site render the centered PDF badge — include one.
Validate that the final file is strict JSON.

## 3. The papers list: data/papers.json

Return the COMPLETE updated file: existing entries byte-for-byte
untouched, with one new entry added to the right section — `conference`
for an accepted or published conference paper, `preprints` for an arXiv
preprint, `abstracts` for an extended abstract (doctoral consortium and
the like). Insert it at the TOP of that section's `entries` (each section
is newest first). Entry shape:

    {
      "title": "Full paper title, exactly as on the paper",
      "authors": ["Gaurab Pokharel", "Coauthor Name", "…"],   ← in paper order
      "venue": "Full venue name (VENUE YEAR), city, pages"
               or "arXiv:NNNN.NNNNN" for a preprint,
      "year": "YYYY",
      "note": "" (or "Spotlight", "Oral", "Best paper", …),
      "links": [ { "label": "DOI" or "arXiv", "url": "https://…" } ],
      "project": "<id>"
    }

If the paper was already listed as a preprint and is now accepted, move
the existing entry into `conference`, update `venue` and `links`, and do
not leave a duplicate behind. Validate that the final file is strict JSON.

## 4. The thumbnail: assets/img/projects/<id>.png

The grid thumbnails are a matched set: minimal, text-free diagrams that
each convey the paper's core mechanism in one glance. Yours must look
like a sibling of the existing seven (a decision tree with a dashed
override arrow; bars crossing a dashed threshold; two trajectories
diverging from one origin; two rankings connected by crossing lines; a
bipartite matching; a corridor with a detour path; houses on a timeline
with a dashed cutoff).

Non-negotiable spec:
- 1200×750 PNG (16:10 — the card crop), flat vector-style geometry,
  under ~50 KB. Keep all meaningful geometry inside ~130 px margins so
  `object-fit: cover` can trim edges safely.
- EXACTLY this palette, nothing else:
  background `#fbfaf8`; structure strokes `#6b6b64`; quiet/inactive
  elements `#e7e3dc`; soft fills `#e7f0ee`; white plates `#ffffff`;
  the single accent idea `#14655b` (secondary accent `#0e4a43`); rare
  dark dots `#1b1b1a`.
- One accent-colored focal element that IS the paper's idea; everything
  else stays quiet. Strokes 8–10 px at this canvas size, round caps and
  joins, dashes around `20 16`, corner radii ~16–26 px. NO text, NO
  logos, NO gradients, NO shadows, NO photographs.
- Build it as an SVG you design yourself, then rasterize to PNG. If your
  environment cannot output image files, deliver the complete SVG source
  as `assets/img/projects/<id>.svg-source.txt` instead, plus this exact
  conversion command for me, and say so in the checklist:
  `python3 -c "import cairosvg; cairosvg.svg2png(url='<id>.svg', write_to='<id>.png', output_width=1200, output_height=750)"`

Before finalizing, describe the concept in one sentence and confirm it
depicts the problem, not a generic ornament.

## 5. Figures from the PDF

If you can extract the paper's figures programmatically, deliver each as
`assets/img/projects/<id>/<short-descriptive-name>.png` at a sensible
resolution (≥ ~1000 px wide for multi-panel figures). If you cannot,
still reference those exact paths in the Markdown and give me a numbered
list mapping each path to the figure in the PDF (page number and figure
number) so I can export them myself. White or transparent backgrounds
are both fine — the site mounts figures on a white plate.

## 6. Optional news item: data/news.json

One entry in this shape, to be PREPENDED (list is newest first), with
today's date and an inline link to the project page:

    { "date": "YYYY-MM-DD",
      "title": "Paper accepted at VENUE YEAR",
      "body": "One sentence with a [link](project.html?id=<id>) to the project.",
      "link": "" }

## Hard rules

- Touch nothing else. No changes to any HTML, CSS, or JS file; no new
  colors, fonts, dependencies, or directories beyond the paths above.
- Full file contents for everything you produce, each with its path. If
  you can create real downloadable files, do that too.
- Self-check before answering, and state that you did: the id is unique;
  the JSON parses; every image path in the Markdown appears in your
  figure list or deliverables; the Markdown contains no `$`, no
  `style=`, no frontmatter, no `#` h1, and every `---` has blank lines
  around it; the thumbnail uses only the listed hex colors at 1200×750.

## Finish by repeating my installation checklist

End your reply by echoing the following checklist back to me verbatim,
with `<id>` and any file names filled in with the real values, so I can
follow it without scrolling up:

1. Add the write-up at `data/projects/<id>.md`.
2. Replace `data/projects.json` with the updated file (only the new
   entry differs — existing entries are unchanged).
3. Replace `data/papers.json` with the updated file (only the new entry
   differs — existing entries are unchanged).
4. Add the thumbnail at `assets/img/projects/<id>.png` (1200×750).
5. Create the folder `assets/img/projects/<id>/` and put the figure
   images in it: <list each file, and, if I must export them myself,
   which figure/page of the PDF each comes from>.
6. Optional: prepend the news entry to `data/news.json`.
7. Nothing else changes — papers.html, project.html and the scripts pick
   the new paper up automatically.
8. Test locally: run `python3 -m http.server 8000` from the repo root,
   open DevTools → Network → tick "Disable cache", then check
   `http://localhost:8000/papers.html` (new entry in the right section),
   `http://localhost:8000/projects.html` (new card + thumbnail) and
   `http://localhost:8000/project.html?id=<id>` (title, tags, buttons,
   figures, PDF badge, and the not-found page still works for a bogus id).
9. Commit and push; after the GitHub Pages build finishes, hard-refresh
   the live pages.