# gpokharel.com

Personal academic website for Gaurab Pokharel, hosted on GitHub Pages at
https://gpokharel.com.

Plain HTML, CSS and vanilla JavaScript. No framework, no bundler, no build
step, no backend. Every page is a static shell; all content lives in the
`update/` folder and the page scripts render it in the browser. All paths are
relative, so the site works at the domain root.

To change what the site says, read [`update/README.md`](update/README.md).
This file describes how the site is built.

## Repository layout

```
.
├── index.html            Home: headline, job-market box, recent papers, news
├── papers.html           Papers: conference papers, preprints, extended abstracts
├── projects.html         Projects grid
├── project.html          One project, opened as project.html?id=<id>
├── cv.html               CV
├── 404.html              Not-found page
├── CNAME                 Custom domain for GitHub Pages
├── .nojekyll             Tells Pages to serve the files as they are
├── update/               ALL CONTENT. The only folder edited day to day.
│   ├── README.md         How to update each thing
│   ├── site.json         Name, role, headline, intro, job-market box, links
│   ├── news.json         News items
│   ├── papers.json       Every paper, entered once
│   ├── projects.json     Project list
│   ├── projects/<id>/    One folder per project: writeup.md, thumbnail, figures
│   ├── cv.json           CV sections other than publications
│   ├── cv.pdf            Downloadable CV
│   └── profile.jpg       Portrait
├── prompts/              Prompts for a language model: project page, card picture, CV
└── assets/
    ├── css/main.css      All styles and the design tokens
    ├── css/print.css     Print rules for the CV page
    ├── js/site.js        Shared shell and helpers (header, footer, paper helpers)
    ├── js/home.js        index.html
    ├── js/papers.js      papers.html
    ├── js/projects.js    projects.html
    ├── js/project.js     project.html
    ├── js/cv.js          cv.html
    └── img/              favicon.png, apple-touch-icon.png, og.png
```

## How a page is put together

Every page uses the same skeleton: the head loads the two Google font
families (Instrument Serif and Inter) and `assets/css/main.css`; the body has
an empty `<header id="site-header">`, a `<main id="content">` with the page's
own markup, an empty `<footer id="site-footer">`, then `assets/js/site.js`
followed by the page's own script. Only the title, the description, the
contents of `main` and the page script differ between pages.

`assets/js/site.js` runs on every page. It draws the header (the name on the
left; Home, Papers, Projects, CV on the right, or in a row under the name on
phones) and the footer (GitHub, LinkedIn, Google Scholar and email icons, then
"© year name"), and marks the active nav link by file name: `index` is Home,
`papers` is Papers, `projects` and `project` are Projects, `cv` is CV. It also
exposes helpers on `window.Site`:

```js
Site.paths                      // where each update/ file lives
Site.fetchJSON(path)            // fetch + parse JSON, cached per path
Site.loadSite()                 // update/site.json (with a fallback)
Site.formatDate("2026-06-25")   // "June 25, 2026"; add "short" for "Jun 25, 2026"
Site.getParam("id")             // query-string value
Site.inline(text)               // [links](url), **bold**, *italic* to safe HTML
Site.keepCompounds(node)        // keeps "Street-Level" on one line in a title
Site.papers.venueLine(paper)    // full venue line built from the entry's fields
Site.papers.shortVenue(paper)   // "NeurIPS 2026"
Site.papers.links(paper)        // arXiv, DOI and extra links
Site.papers.appendAuthors(...)  // author list with the owner's name in bold
Site.papers.bibtex(paper)       // generated BibTeX
```

`fetchJSON`, `formatDate` and `getParam` are also available directly on
`window`, as before.

### One entry per paper

A paper is typed once, in `update/papers.json`. Four pages read that entry:

| Page | What it takes from the entry |
| --- | --- |
| Papers | The full listing, with the venue line and links. |
| Home | The first few entries, shown as recent papers. |
| CV | The publication sections. `cv.json` only names which section goes where: `{ "title": "Preprints", "papers": "preprints" }`. |
| Project page | The authors, affiliations, venue, links, BibTeX citation and funding note of the paper whose `project` matches the page. |

A write-up therefore contains only prose and figures. When a paper is
accepted, `papers.json` is the single file that changes.

### The pages

| Page and script | Reads | Notes |
| --- | --- | --- |
| `index.html`, `home.js` | `site.json`, `papers.json`, `news.json` | Shows the newest papers and news; older news folds away. |
| `papers.html`, `papers.js` | `papers.json` | Skips sections marked `"listed": false`. |
| `projects.html`, `projects.js` | `projects.json` | Current projects first, with an All / Current / Past filter. Each picture is `update/projects/<id>/thumbnail.png`, or the file named in the entry's `thumbnail` field, and is lazy-loaded. |
| `project.html`, `project.js` | `projects.json`, `papers.json`, `projects/<id>/writeup.md` | Renders the write-up with `marked` 12.0.2 from a pinned CDN address. |
| `cv.html`, `cv.js` | `cv.json`, `papers.json` | Uses `assets/css/print.css` when printed. |

`marked` is the site's one external script. It loads only on the project
page, and only when a write-up exists. Figure paths in a write-up are bare
file names; `project.js` points them at the project's folder and links each
figure to its full-size image.

### Local preview and the error banner

Because the pages fetch JSON, preview through a local HTTP server:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

On `localhost`, a file in `update/` that is missing or is not valid JSON
produces a banner at the top of the page naming the file and the problem.
The live site never shows it; there the affected section is simply left out.

If a change seems not to apply, the browser is usually holding an old copy:
hard-refresh with Ctrl+Shift+R (Cmd+Shift+R on a Mac).

## Design

"Quiet editorial": a warm paper background, one teal accent, section names set
in a left margin with a thin rule above each section.

| Aspect | Rule |
| --- | --- |
| Tokens | All colors, fonts and sizes come from the custom properties at the top of `assets/css/main.css`. Do not introduce others. |
| Type | Instrument Serif (one weight) for the wordmark, the home headline, page titles, section headings and project card titles. Inter 400, 500 and 600 for everything else. Headings are sentence case. |
| Layout | `.container` caps the width at 1080px. A `.band` is one section: a rule across the top, the section name in a 180px left margin from 860px up, and the content beside it. Below 860px the name stacks above the content. |
| Breakpoints | 600px (phone layouts end), 768px (two-column home hero), 860px (margin labels), 1024px (three project columns). |
| Phones | The name sits above a row with all four nav links; there is no menu button. Project cards become compact rows with a small picture. CV dates move under the entry. Write-ups are left-aligned (they are justified from 600px up). |
| Accessibility | Semantic landmarks, a skip link, alt text, visible focus, 44px tap targets on touch screens, WCAG AA contrast, and `prefers-reduced-motion` respected. |
| Styles | No inline styles. All styling is in `main.css`, organised into numbered sections listed at the top of the file. |

## Deployment

Push to the GitHub repository and serve the root of the default branch with
GitHub Pages. `CNAME` pins the custom domain and `.nojekyll` tells Pages to
serve the files without Jekyll processing. There is no build step: what is in
the repository is what is served.

GitHub Pages serves `404.html` for any unknown address. For root-level typos
it renders fully styled. For unknown addresses nested more than one level
deep, the relative asset links do not resolve and the page renders as plain
text; since all real pages are at the root, this is a cosmetic edge case.
