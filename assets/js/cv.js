/* ==========================================================================
   cv.js — CV page, loaded after site.js on cv.html only.

   Reads update/cv.json and renders its sections in file order, each with
   its name in the left margin. The publication lists are not typed into
   cv.json: a section written as

       { "title": "Peer-reviewed conference papers", "papers": "conference" }

   is filled from the section of update/papers.json with that id, so a paper
   is entered once and shows up on the Papers page and here.

   update/cv.json shape:
   {
     "pdf": "update/cv.pdf",
     "updated": "October 2026",            // free text, or an ISO date
     "sections": [
       {
         "title": "Education",
         "entries": [
           {
             "primary":   "Ph.D., Computer Science",   // semibold title
             "secondary": "Virginia Tech",             // muted line under it
             "date":      "2021–present",              // right-hand column
             "detail":    "One paragraph"              // or an array of
                          | ["Bullet", "Bullet"],      //   bullet strings
             "links":     [ { "label": "Details", "url": "https://…" } ]
           }
         ]
       },
       { "title": "Preprints", "papers": "preprints" }
     ]
   }

   Every field is optional. An entry with no "primary" is shown as a plain
   paragraph (or a plain list), which is how Research interests is written.
   "secondary" and "detail" may use inline Markdown: [text](url), **bold**
   and *italic*. Links are placed at the end of the entry's muted line.
   ========================================================================== */

(function () {
  "use strict";

  const Site = window.Site;
  const container = document.getElementById("cv-sections");
  if (!container) return;
  if (!Site) {
    console.error("cv.js: window.Site missing. assets/js/site.js must load first.");
    return;
  }
  const el = Site.el;
  const FALLBACK_PDF = "update/cv.pdf";

  init();

  async function init() {
    // Papers and site details are extras: without them the CV still renders,
    // minus the publication lists.
    const papersRequest = Site.fetchJSON(Site.paths.papers).catch(function () { return null; });
    const siteRequest = Site.loadSite();

    let data;
    try {
      data = await Site.fetchJSON(Site.paths.cv);
    } catch (error) {
      renderError();
      return;
    }
    const papers = await papersRequest;
    const site = await siteRequest;

    // Point the download button at the path declared in cv.json.
    document.querySelectorAll(".cv-download").forEach(function (button) {
      button.setAttribute("href", data.pdf || FALLBACK_PDF);
    });

    // "Last updated ..." line under the heading.
    const updated = document.getElementById("cv-updated");
    if (updated && data.updated) {
      updated.textContent = "Last updated " + Site.formatDate(data.updated);
      updated.hidden = false;
    }

    const fragment = document.createDocumentFragment();
    (Array.isArray(data.sections) ? data.sections : []).forEach(function (section) {
      const node = renderSection(section, papers, site.name || "");
      if (node) fragment.appendChild(node);
    });
    container.textContent = "";
    container.appendChild(fragment);
  }

  /* ---------------------------------------------------------------------- */
  /* Sections                                                                */
  /* ---------------------------------------------------------------------- */

  function renderSection(section, papers, owner) {
    if (!section) return null;
    const list = el("ul", "cv-entries");

    if (section.papers) {
      // Filled from update/papers.json.
      const source = papers && Array.isArray(papers.sections)
        ? papers.sections.find(function (s) { return s && s.id === section.papers; })
        : null;
      (source && Array.isArray(source.entries) ? source.entries : []).forEach(function (paper) {
        if (paper && paper.title) list.appendChild(renderPaper(paper, owner));
      });
    } else {
      (Array.isArray(section.entries) ? section.entries : []).forEach(function (entry) {
        if (entry) list.appendChild(renderEntry(entry));
      });
    }
    if (list.childNodes.length === 0) return null; // nothing to show

    const wrapper = el("section", "band cv-section");
    const inner = el("div", "container band-inner");
    inner.appendChild(el("h2", "band-label", section.title || ""));
    const body = el("div", "band-body");
    body.appendChild(list);
    inner.appendChild(body);
    wrapper.appendChild(inner);
    return wrapper;
  }

  /* ---------------------------------------------------------------------- */
  /* Entries                                                                 */
  /* ---------------------------------------------------------------------- */

  /** The title, then the date. main.css places the date in a fixed column
      on the right (or after the muted lines on phones). */
  function appendHead(item, primary, date) {
    item.appendChild(Site.keepCompounds(el("h3", "cv-primary", primary)));
    if (date) item.appendChild(el("p", "cv-date", date));
  }

  /** Append " · Label · Label" links to a muted line. The spaces around
      each dot are non-breaking, so a link never wraps away from its dot and
      a line never ends with a stray dot: the last word and the links move
      to the next line together. */
  function appendLinks(line, links) {
    links.forEach(function (link) {
      if (line.childNodes.length) line.appendChild(document.createTextNode("\u00a0·\u00a0"));
      line.appendChild(Site.setLink(el("a", "", link.label), link.url));
    });
  }

  /** One entry from cv.json. */
  function renderEntry(entry) {
    const item = el("li", "cv-entry");
    const details = Array.isArray(entry.detail)
      ? entry.detail.filter(Boolean)
      : (entry.detail ? [entry.detail] : []);

    // No title: a plain paragraph, or a plain list (research interests).
    if (!entry.primary) {
      if (Array.isArray(entry.detail)) {
        const list = el("ul", "cv-detail-list cv-text");
        details.forEach(function (text) { list.appendChild(inlineNode("li", "", text)); });
        item.appendChild(list);
      } else if (details.length) {
        item.appendChild(inlineNode("p", "cv-text", details[0]));
      }
      return item;
    }

    appendHead(item, entry.primary, entry.date);

    // Muted line, with any links at its end.
    const links = (Array.isArray(entry.links) ? entry.links : []).filter(function (link) {
      return link && link.url;
    }).map(function (link) {
      return { label: link.label || "Link", url: String(link.url) };
    });
    if (entry.secondary || links.length) {
      const line = entry.secondary ? inlineNode("p", "cv-secondary", entry.secondary) : el("p", "cv-secondary");
      appendLinks(line, links);
      item.appendChild(line);
    }

    // Details: one paragraph, or bullets.
    if (Array.isArray(entry.detail) && details.length) {
      const list = el("ul", "cv-detail-list");
      details.forEach(function (text) { list.appendChild(inlineNode("li", "", text)); });
      item.appendChild(list);
    } else if (details.length) {
      item.appendChild(inlineNode("p", "cv-detail", details[0]));
    }
    return item;
  }

  /** One paper from papers.json, in the same anatomy as every other entry:
      title and year, the author line, then the venue line with its links. */
  function renderPaper(paper, owner) {
    const item = el("li", "cv-entry");
    appendHead(item, paper.title, paper.year);

    if (paper.authors && paper.authors.length) {
      item.appendChild(Site.papers.appendAuthors(el("p", "cv-secondary"), paper, owner));
    }

    const line = el("p", "cv-secondary");
    const venue = Site.papers.venueLine(paper);
    if (venue) line.appendChild(document.createTextNode(venue));
    const links = Site.papers.links(paper).map(function (link) {
      return { label: link.label, url: link.url };
    });
    if (paper.note) {
      // The pill and the links after it wrap as one unit, after an
      // ordinary space, so a wrapped pill starts flush with the text.
      if (venue) line.appendChild(document.createTextNode(" "));
      const group = el("span", "nobreak");
      group.appendChild(el("span", "pill", paper.note));
      appendLinks(group, links);
      line.appendChild(group);
    } else {
      appendLinks(line, links);
    }
    if (line.childNodes.length) item.appendChild(line);
    return item;
  }

  /** An element whose content is a text field with inline Markdown. */
  function inlineNode(tag, className, text) {
    const node = el(tag, className);
    node.innerHTML = Site.inline(text);
    return node;
  }

  function renderError() {
    container.textContent = "";
    const message = el("p", "page-note container", "The CV could not be loaded right now. ");
    const fallback = el("a", "", "Download the PDF instead.");
    fallback.setAttribute("href", FALLBACK_PDF);
    message.appendChild(fallback);
    container.appendChild(message);
  }
})();
