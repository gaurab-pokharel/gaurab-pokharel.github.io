# gpokharel.com

Personal academic website for Gaurab Pokharel, hosted on GitHub Pages at
https://gpokharel.com.

Plain HTML + CSS + vanilla JavaScript. No framework, no bundler, no build
step, no backend. Every page is a static shell; content lives in JSON (and
one Markdown file per project) under `data/`, and a small shared script
injects the header and footer on every page. All paths are relative so the
site works at the domain root.

## Repository layout

```
.
├── index.html            # Home: hero + recent news
├── papers.html           # Papers: conference papers, preprints, extended abstracts
├── projects.html         # Projects list
├── project.html          # Project detail, opened as project.html?id=<id>
├── cv.html               # CV
├── 404.html              # Not-found page
├── CNAME                 # Custom domain for GitHub Pages
├── .nojekyll             # Disables Jekyll processing on Pages
├── README.md
├── data/
│   ├── site.json         # Name, role, email, social links, bio, meta
│   ├── news.json         # Recent news, newest first
│   ├── papers.json       # Papers, grouped into three sections, newest first
│   ├── projects.json     # Project metadata for cards + detail page
│   ├── cv.json           # CV sections and entries
│   └── projects/         # One Markdown write-up per project: <id>.md
└── assets/
    ├── css/
    │   ├── main.css      # All site styles + design tokens
    │   └── print.css     # Print styles for the CV
    ├── js/
    │   ├── site.js       # Shared shell: header/footer injection + helpers
    │   ├── home.js       # index.html
    │   ├── papers.js     # papers.html
    │   ├── projects.js   # projects.html
    │   ├── project.js    # project.html
    │   └── cv.js         # cv.html
    ├── img/
    │   ├── profile.jpg   # Portrait for the home page
    │   ├── favicon.png   # Favicon
    │   ├── og.png        # Optional link-preview image
    │   └── projects/     # One thumbnail per project, <id>.png (shown ~16:10),
    │                     #   plus <id>/ folders holding each write-up's figures
    └── files/
        ├── cv.pdf        # Downloadable CV
        └── papers/       # Optional local paper PDFs
```

`.gitkeep` files hold otherwise-empty asset directories in git; delete them
once real files are added.

## How a page is put together

Every page uses the exact same skeleton (see `404.html` for a live example):
the head loads the two Google font families and `assets/css/main.css`; the
body contains an empty `<header id="site-header">`, a `<main id="content">`
with the page's own markup, an empty `<footer id="site-footer">`, and
`assets/js/site.js` followed by the page's own script. Only the title, the
meta description, the contents of `main`, and the page script differ
between pages.

`assets/js/site.js` runs on every page. It fetches `data/site.json` once,
injects the header (wordmark → `index.html`, nav Home / Papers / Projects /
CV, collapsing behind a menu button below 768px) and the footer (GitHub /
LinkedIn / Google Scholar / email icon links plus "© year name"), and marks
the active nav link by file name: `index` → Home, `papers` → Papers,
`projects` and `project` → Projects, `cv` → CV. It also exposes three
helpers on `window` for the page scripts:

```js
await fetchJSON("data/news.json")   // fetch + parse JSON, throws on failure
formatDate("2026-06-25")            // → "June 25, 2026" (non-ISO input passes through)
getParam("id")                      // → query-string value, e.g. on project.html?id=x
```

If `site.json` cannot be fetched (e.g. a page opened via `file://`, where
browsers block `fetch`), site.js falls back to a minimal built-in shell so
the header and footer still render; serve over HTTP for the real thing.

## The pages

Each page copies the skeleton, sets its own title/description, adds its
markup inside `main#content`, and loads one page script after `site.js`.

- **index.html + home.js** — reads `site.json` (each `bio` string is
  rendered as HTML because the paragraphs contain inline links, plus
  `profileImage`, name, role) and `news.json` (dates through `formatDate`,
  newest six items). Hero is two columns, stacking on narrow screens.
- **papers.html + papers.js** — reads `papers.json` and renders each
  section as a heading over a plain list: title, author list with the
  owner's name emphasised, year, venue with an optional note pill, and
  link pills (DOI, arXiv, and a "Project page" link when the entry names a
  project id).
- **projects.html + projects.js** — reads `projects.json` and renders cards
  into the `.card-grid` / `.card` styles (grid steps 3 → 2 → 1 columns).
  Thumbnails are lazy-loaded (`loading="lazy"`).
- **project.html + project.js** — reads `getParam("id")`, finds the entry in
  `projects.json`, and if `body` is set fetches `data/projects/<body>.md`
  and renders it with a small Markdown parser from a pinned CDN version —
  the only external runtime dependency allowed, and only on this page.
- **cv.html + cv.js** — reads `cv.json`, renders sections/entries, links the
  PDF, and adds `assets/css/print.css` for printing.

## Updating content

**News** (`data/news.json`): prepend a new object — the list stays newest
first. Each item is `{ "date", "title", "body", "link" }`: `date` is ISO
(`YYYY-MM-DD`); `body` may use `**bold**` and `[text](url)` links; use `""`
for `link` when there isn't one. Links may be relative
(`project.html?id=...`) or absolute. The home page shows the newest six.

**Papers** (`data/papers.json`): three sections (`conference`, `preprints`,
`abstracts`) render in file order, and so do the entries within each, so
keep each list newest first. An entry is:

```json
{
  "title": "Paper title",
  "authors": ["Gaurab Pokharel", "Coauthor Name"],
  "venue": "Venue name (VENUE YEAR), city, pages",
  "year": "2026",
  "note": "Spotlight",
  "links": [ { "label": "DOI", "url": "https://..." } ],
  "project": "kebab-id"
}
```

`authors` is an ordered array (joined as "A, B, and C"); `note` and
`project` may be `""`. When a preprint is accepted, move its entry from
`preprints` to `conference` and update `venue`. The same paper usually also
has a `cv.json` entry, a `projects.json` link label, and a `Venue` line and
BibTeX block in its write-up, so update those together.

**Projects** (`data/projects.json`): add an object with a kebab-case `id`,
`title`, `period`, `status` (`current` or `past`), a one-line `summary`,
`thumbnail`, `tags`, `links` (array of `{label, url}`, may be empty), and an
optional `body`. If `body` is set, place the full write-up at
`data/projects/<body>.md` and the thumbnail at
`assets/img/projects/<id>.png`. `new_project_prompt.md` in the repo root is
a reusable prompt for adding a paper end to end.

**CV** (`data/cv.json`): sections render in array order; each entry is
`primary | secondary | date | detail | links`, where `detail` is a string
or an array of bullet strings and `links` is an array of `{label, url}`.
`updated` (ISO date) shows as "Last updated …" under the heading. Replace
`assets/files/cv.pdf` when the PDF changes.

**Identity** (`data/site.json`): name, role, email, and social URLs feed the
shell on every page. `bio` is an array of paragraph strings stored as HTML,
so inline `<a href="...">` links are allowed there.

## Local preview

Because the pages fetch JSON, preview through a local HTTP server. From the
repository root:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening an HTML file directly from disk still shows the page with a
fallback header/footer, but browsers block `fetch` on `file://`, so the
JSON-driven content won't load that way.

If a change seems not to apply, it is almost always the browser's cache
holding an old `main.css`: open DevTools, tick "Disable cache" under the
Network tab, and reload (or hard-refresh with Ctrl+Shift+R, Cmd+Shift+R on
a Mac).

## Deployment

Push to the GitHub repository and serve the root of the default branch with
GitHub Pages. `CNAME` pins the custom domain (`gpokharel.com`); `.nojekyll`
tells Pages to serve the files as-is without Jekyll processing. No build
step — what's in the repo is what's served.

One caveat inherent to the relative-path contract: GitHub Pages serves
`404.html` for any unknown URL. For root-level typos
(`gpokharel.com/whatever`) it renders fully styled; for unknown URLs nested
more than one level deep the relative asset links won't resolve, so the 404
renders as plain text. Since all real pages live at the root, this is a
cosmetic edge case.

## Design and conventions

All colors, fonts, and spacing come from the design tokens at the top of
`assets/css/main.css` — don't introduce others. Body/UI text is Inter; the
name and headings are Source Serif 4, sentence case, weight 500–600. Type
and spacing scale fluidly via `clamp()`; layout breakpoints sit around 480,
768, and 1024px. No inline styles anywhere; all styling lives in `main.css`
(plus `print.css` for the CV), organised into numbered sections listed at
the top of the file. Accessibility floor: semantic landmarks, a skip link,
alt text, visible focus, 44px mobile tap targets, WCAG AA contrast, and
`prefers-reduced-motion` respected.
