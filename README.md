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
├── favicon.ico           Tab icon for addresses that are not pages, such as the CV PDF
├── CNAME                 Custom domain for GitHub Pages
├── .nojekyll             Tells Pages to serve the files as they are
├── .gitattributes        Tells GitHub that the content files may hold notes
├── .vscode/settings.json Tells VS Code the same
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
    ├── js/motion.js      Page transitions: which way to slide (every page)
    ├── js/home.js        index.html
    ├── js/dots.js        The dot grid behind the top band of each page, with its on/off switches
    ├── js/papers.js      papers.html
    ├── js/projects.js    projects.html
    ├── js/project.js     project.html
    ├── js/cv.js          cv.html
    └── img/              favicon.png, apple-touch-icon.png, og.png
```

## How a page is put together

Every page uses the same skeleton: the head loads the two Google font
families (Instrument Serif and Inter), `assets/css/main.css` and
`assets/js/motion.js`; the body has an empty `<header id="site-header">`, a
`<main id="content">` with the page's own markup, an empty
`<footer id="site-footer">`, then `assets/js/site.js` followed by the page's
own script. Only the title, the description, the contents of `main` and the
page script differ between pages.

Every page except the not-found page wraps the band at its top (the headline
and portrait on the home page, the page heading on the others) in
`<div class="dot-band" data-dots="NAME">` and loads one more script last,
`assets/js/dots.js`, which draws the dot grid behind that band.

`assets/js/site.js` runs on every page. It draws the header (the name on the
left; Home, Papers, Projects, CV on the right, or in a row under the name on
phones) and the footer (GitHub, LinkedIn, Google Scholar and email icons, then
"© year name"). The tabs are listed once, in `NAV_ITEMS` near the top of the
file, and the tab whose page is open is marked; a project page marks
Projects. Each nav link ends with an empty `span.nav-mark`, which is drawn as
the underline of the active tab. Once a page has finished loading, `site.js`
fetches the content files that page did not use, so they are already in the
browser's cache when the next page asks for them.

`site.js` also exposes helpers on `window.Site`:

```js
Site.paths                      // where each update/ file lives
Site.fetchJSON(path)            // fetch + read a content file, cached per path
Site.parseContent(text)         // the text of a content file to data (notes allowed)
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

### The content files may hold notes

The five files in `update/` are JSON with two allowances that make them easier
to edit by hand:

- A note. Whatever follows `//` on a line is a note, and so is anything
  between `/*` and `*/`. The files use notes for their headings, their
  dividers and a template to copy.
- A comma after the last item of a list. Strict JSON forbids it, and it is
  the most common slip when pasting a new item.

`stripNotes` in `site.js` removes both before the text is parsed. Every page
reads its content through `Site.fetchJSON`, so the rule is the same on every
page. A real mistake, such as a missing comma or quote, is still reported.

Because of the notes, a tool that expects strict JSON (`jq`, Python's `json`
module) will not read these files as they are. Two small files keep editors
from marking the notes as mistakes: `.gitattributes` does it for GitHub and
`.vscode/settings.json` for VS Code.

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

All five of these pages also load `dots.js`, which draws the dot grid and reads
no content.

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

On `localhost`, a file in `update/` that is missing or has a mistake in it
produces a banner at the top of the page naming the file, the problem and
the line it is on.
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
| Phones | The name sits above a row with all the nav links; there is no menu button. Four links fit on the narrowest phones, and a fifth would wrap to a second row. Project cards become compact rows with a small picture. CV dates move under the entry. Write-ups are left-aligned (they are justified from 600px up). |
| Accessibility | Semantic landmarks, a skip link, alt text, visible focus, 44px tap targets on touch screens, WCAG AA contrast, and `prefers-reduced-motion` respected. |
| Styles | No inline styles. All styling is in `main.css`, organised into numbered sections listed at the top of the file. |

## Motion

The site has page transitions, small reactions to the pointer, and a dot grid
behind the top band of each page. None of it is needed to use the site: a
browser that ignores all of it shows the same pages, standing still.

| What moves | Where the code is | What it does |
| --- | --- | --- |
| Page transitions | `assets/js/motion.js` and section 17a of `main.css` | Going from one page to another slides the content left or right, following the order of the tabs. The header holds still and the underline travels to the new tab. |
| Reactions | Section 17b of `main.css` | Pictures zoom slightly inside their frames, underlines draw in, buttons spring, arrows nudge, and the small labels and footer icons wiggle. Text blocks and whole cards never move. |
| Dot grid | `assets/js/dots.js` and section 17c of `main.css` | A faint grid of dots behind the top band of each page: the headline and portrait on the home page, and the page heading on Papers, Projects, a single project and the CV. It drifts slowly, and the dots near the pointer grow, turn teal and lean away. |

### Turning the dot grid off or on

Open `assets/js/dots.js`. The settings block near the top begins with the
switches:

```js
const DOT_GRID = {
  enabled: true,   // true = the dot grid is on, false = off on every page

  // One line per page. Change a line to false to leave the grid off there.
  pages: {
    home: true,      // index.html
    papers: true,    // papers.html
    projects: true,  // projects.html
    project: true,   // project.html, the page of a single project
    cv: true         // cv.html
  },
```

To turn the grid off everywhere, change `enabled` to `false`. To turn it off
on one page, change that page's line under `pages` to `false`. No other file
needs to change. Where the grid is off, the script adds nothing to the page
and does no work.

The same block holds the other settings:

| Setting | Default | Meaning |
| --- | --- | --- |
| `strength` | `1` | How visible the dots are. `0.5` is half as visible, `1.5` half again as much. |
| `spacing` | `28` | Distance between dots, in pixels. |
| `reach` | `120` | How far the pointer's effect spreads, in pixels. |
| `push` | `5` | How far the dots beside the pointer lean away, in pixels. |
| `drift` | `true` | The slow wave that passes through the grid. |
| `react` | `true` | Whether the dots respond to the pointer. |

The grid stays inside the band at the top of the page, between the rule under
the header and the next rule down, so it never runs under the header. It is
faint behind the text on the left and fuller toward the right; on the home
page that is toward the portrait. It stops drawing while the band is scrolled
out of view or the browser tab is in the background.

A dot behind a word darkens the page a little at that spot, which lowers the
contrast of the word. The script finds the text in the band, works out from
each color how strong a dot may get before that text would drop under the
WCAG AA contrast figure (4.5 to 1, or 3 to 1 for large text), and never draws
a dot behind it stronger than that. With the settings above this changes
nothing while the pointer is away. It only limits how dark a dot behind the
gray lines or a link turns when the pointer is right on it. Text added to a
band later, in any token color, is covered without further work.

### How the page transition works

The browser animates the move between two pages itself (the feature is called
view transitions). `main.css` switches it on with
`@view-transition { navigation: auto; }` and defines the animations.
`motion.js` only supplies the direction. When a page is left, it stores the
page's name in `sessionStorage`. When the next page opens, it compares the two
names with the order of the tabs (Home, Papers, Projects, CV, with a project
page straight after Projects) and tells the browser `forward` or `back`.
When it cannot tell, the two pages cross-fade.

If a tab is added to the nav, add its page to `ORDER` at the top of
`motion.js` (see "Adding a tab" below).

The header and the nav underline each have a `view-transition-name`, which is
what lets them hold still while the rest slides. On a scrolled page the header
is not in the same place on both pages, so `motion.js` puts the class
`vt-header-off` on `<html>` for the length of the transition and the header
slides with everything else.

A page fetches its content after it opens. So that it does not slide in half
empty, `site.js` fetches the other pages' content files once the current page
has finished loading. It skips this for visitors who have data saver switched
on.

`html` has `scrollbar-gutter: stable`, which keeps the room for the scrollbar
on every page. Without it the content would jump sideways between a short page
and a long one.

### Who sees what

| Visitor | What they get |
| --- | --- |
| Chrome, Edge, and Safari 18.2 or later | Everything. |
| Firefox | Pages load without the slide, because Firefox does not have this kind of page transition yet. The reactions and the dot grid work. |
| Phones and tablets | The slide and the drifting dot grid. There is no pointer, so nothing reacts to hovering; buttons still dip when pressed. |
| Anyone who asks their system for reduced motion | No slide, no zoom, no wiggle, and a dot grid that stands still. Underlines still appear on hover and on keyboard focus. |

### Rules for adding motion

- A hover effect goes inside `@media (hover: hover)`, because on a touch
  screen a hover state stays stuck after a tap.
- Anything that moves, grows or wiggles also goes inside
  `(prefers-reduced-motion: no-preference)`.
- Timing curves come from the two easing tokens, `--ease-out` and
  `--ease-spring`.
- Only small things move. Text blocks and whole cards stay where they are.

## Adding a tab

These are all the steps for a new tab. The example adds a tab called "My lab"
between Projects and CV, at the address `lab.html`. For another name, replace
`lab` and "My lab" wherever they appear.

A tab is three new files and four one-line edits.

| New file | What it is |
| --- | --- |
| `update/lab.json` | The page's content. |
| `lab.html` | The page. |
| `assets/js/lab.js` | The script that puts the content on the page. |

| One-line edit | File | What it is for |
| --- | --- | --- |
| Add the content file to `PATHS` | `assets/js/site.js` | Pages can find the file, and it is fetched ahead of time. |
| Add the tab to `NAV_ITEMS` | `assets/js/site.js` | The tab shows in the header. |
| Add the page to `ORDER` | `assets/js/motion.js` | The page slides the right way. |
| Add the page to `pages` | `assets/js/dots.js` | The dot grid can be switched off for it. |

### 1. The content: `update/lab.json`

```jsonc
// =============================================================================
//  MY LAB
//
//  One block per section of the page, shown in this order. A section has a
//  "title" and then "text" (one or more paragraphs), "entries" (a list), or
//  both.
//
//  Lines that begin with // are notes, like this one. The site ignores them.
// =============================================================================

{
  "sections": [

    // ---- About --------------------------------------------------------------
    {
      "title": "About",
      "text": [
        "A paragraph about the lab. A link is written [like this](https://example.com)."
      ]
    },

    // ---- People -------------------------------------------------------------
    {
      "title": "People",
      "entries": [
        {
          "primary":   "Name of a person",
          "secondary": "Role, or a short note",
          "date":      "2027–present",
          "detail":    "One or two sentences."
        },

        {
          "primary":   "Name of another person",
          "secondary": "Role, or a short note",
          "date":      "2027–present"
        }
      ]
    }

  ]
}
```

Sections appear on the page in the order written. A section has a `title`,
and then `text` (one or more paragraphs), `entries` (a list), or both. An
entry has the same parts as an entry on the CV page: `primary`, and then
`secondary`, `date` and `detail` if it needs them.

### 2. The page: `lab.html`

Save this in the repository root, next to `cv.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>My lab · Gaurab Pokharel</title>
  <meta name="description" content="The people and projects in Gaurab Pokharel's lab." />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Gaurab Pokharel" />
  <meta property="og:title" content="My lab · Gaurab Pokharel" />
  <meta property="og:description" content="The people and projects in Gaurab Pokharel's lab." />
  <meta property="og:url" content="https://gpokharel.com/lab.html" />
  <meta property="og:image" content="https://gpokharel.com/assets/img/og.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="assets/img/favicon.png?v=2" />
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&amp;family=Inter:wght@400;500;600&amp;display=swap" />
  <link rel="stylesheet" href="assets/css/main.css" />
  <!-- Sets the slide direction for page transitions. It has to run before
       the page is first drawn, which is why it is here and not at the end. -->
  <script src="assets/js/motion.js"></script>
</head>
<body>
  <header id="site-header"></header>
  <main id="content">

    <!-- Page heading. The outer band spans the full width of the window so
         that dots.js can draw the dot grid behind it. -->
    <div class="dot-band" data-dots="lab">
      <section class="page-head container">
        <div>
          <h1>My lab</h1>
          <p class="page-lede">One line that says what this page is.</p>
        </div>
      </section>
    </div>

    <!-- One band per section of update/lab.json, rendered by lab.js. -->
    <div id="lab-sections">
      <p class="page-note container">Loading…</p>
    </div>

  </main>
  <footer id="site-footer"></footer>
  <script src="assets/js/site.js"></script>
  <script src="assets/js/lab.js"></script>
  <!-- The dot grid behind the page heading. Its on/off switches are at the
       top of the file. -->
  <script src="assets/js/dots.js"></script>
</body>
</html>
```

The words to change are the two `title` lines (the browser tab and link
previews), the two description lines, the `<h1>` and the line under it.

### 3. The script: `assets/js/lab.js`

```js
/* ==========================================================================
   lab.js — "My lab" page, loaded after site.js on lab.html only.

   Reads update/lab.json and shows each section in file order: its title in
   the left margin, and beside it the section's paragraphs ("text") and its
   list ("entries"). An entry has the same parts as an entry on the CV page:
   "primary", then "secondary", "date" and "detail" if it has them. "text",
   "secondary" and "detail" may hold [links](address), **bold** and *italic*.
   ========================================================================== */

(function () {
  "use strict";

  const Site = window.Site;
  const container = document.getElementById("lab-sections");
  if (!container || !Site) return;
  const el = Site.el;

  /** An element whose text may hold links, bold and italic. */
  function rich(tag, className, text) {
    const node = el(tag, className);
    node.innerHTML = Site.inline(text);
    return node;
  }

  /** One entry: title, date, muted line, detail. */
  function renderEntry(entry) {
    const item = el("li", "cv-entry");
    item.appendChild(el("h3", "cv-primary", entry.primary));
    if (entry.date) item.appendChild(el("p", "cv-date", entry.date));
    if (entry.secondary) item.appendChild(rich("p", "cv-secondary", entry.secondary));
    if (entry.detail) item.appendChild(rich("p", "cv-detail", entry.detail));
    return item;
  }

  /** One section: its title in the left margin, its content beside it. */
  function renderSection(section) {
    const wrapper = el("section", "band");
    const inner = el("div", "container band-inner");
    inner.appendChild(el("h2", "band-label", section.title || ""));
    const body = el("div", "band-body");

    [].concat(section.text || []).forEach(function (paragraph) {
      body.appendChild(rich("p", "prose", paragraph));
    });

    const entries = [].concat(section.entries || []).filter(function (entry) {
      return entry && entry.primary;
    });
    if (entries.length) {
      const list = el("ul", "cv-entries");
      entries.forEach(function (entry) { list.appendChild(renderEntry(entry)); });
      body.appendChild(list);
    }

    inner.appendChild(body);
    wrapper.appendChild(inner);
    return wrapper;
  }

  Site.fetchJSON(Site.paths.lab).then(function (data) {
    container.textContent = ""; // drops the "Loading" line
    [].concat(data.sections || []).forEach(function (section) {
      container.appendChild(renderSection(section));
    });
  }).catch(function () {
    container.textContent = "";
    container.appendChild(el("p", "page-note container", "This page could not be loaded right now."));
  });
})();
```

It uses the classes the CV page uses for its entries, so the new page needs
no new styles.

### 4. The four one-line edits

In `assets/js/site.js`, near the top, add the content file to `PATHS`:

```js
    cv: "update/cv.json",
    lab: "update/lab.json",
```

In the same file, add the tab to `NAV_ITEMS`, in the place it should have in
the header:

```js
    { label: "Projects", href: "projects.html", also: ["project.html"] },
    { label: "My lab", href: "lab.html" },
    { label: "CV", href: "cv.html" }
```

In `assets/js/motion.js`, add the page's name to `ORDER`, in the same place:

```js
  const ORDER = ["index", "papers", "projects", "project", "lab", "cv"];
```

In `assets/js/dots.js`, add a line under `pages`. Every line but the last
ends with a comma:

```js
      cv: true,        // cv.html
      lab: true        // lab.html
```

### 5. Check it

Preview the site (`python3 -m http.server 8000`) and look at four things:

- The tab is in the header on every page, and it is underlined on the new
  page.
- Going to the new tab and back slides the right way: forward to a tab on
  the right, back to one on the left.
- The page at phone width. Four tabs fit on one row on the narrowest phones.
  With five, the last one wraps to a second row on screens narrower than
  about 380 pixels. A shorter label helps.
- A mistake in `update/lab.json` shows a banner at the top of the page that
  names the file and the line.

Then, if you like, add the new files to the tables in this README and in
`update/README.md`, and add the page to the "You can also browse" line in
`404.html`.

### Removing a tab

Undo the four edits in step 4. The three files can stay or be deleted.

## Deployment

Push to the GitHub repository and serve the root of the default branch with
GitHub Pages. `CNAME` pins the custom domain and `.nojekyll` tells Pages to
serve the files without Jekyll processing. There is no build step: what is in
the repository is what is served. The page transitions and the dot grid are
ordinary files and need no setting on GitHub Pages.

GitHub Pages serves `404.html` for any unknown address. For root-level typos
it renders fully styled. For unknown addresses nested more than one level
deep, the relative asset links do not resolve and the page renders as plain
text; since all real pages are at the root, this is a cosmetic edge case.

GitHub Pages lets a browser keep each file for ten minutes. So for up to ten
minutes after a push, a browser that visited the site recently can show a mix
of old and new files. A hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on a Mac)
fetches the new ones.

### The tab icon

The small picture in the browser tab comes from two files. Every page links
`assets/img/favicon.png?v=2` in its head. `favicon.ico` at the root is for
addresses that are not pages, such as the CV PDF: there is no page to link an
icon from, so the browser looks for that file name on its own.

A browser remembers a site's icon under the icon's address, and it remembers
just as well that it found none. It can hold on to either for weeks, and a
normal refresh does not clear it. So if the icon ever changes, replace both
files and raise the number after `?v=` in the head of every page. The new
address makes each browser fetch the picture again. Any "PNG to ICO"
converter makes `favicon.ico` from the PNG.
