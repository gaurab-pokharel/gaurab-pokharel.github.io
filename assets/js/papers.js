/* ==========================================================================
   papers.js — papers listing page, loaded after site.js on papers.html only.

   Responsibilities:
   • Fetch data/papers.json and render its sections (conference papers,
     preprints, extended abstracts) in file order, each as a heading over a
     plain list of papers. Entries are also kept in file order, so the data
     file controls the ordering: keep it newest first.
   • Each entry: the title (serif, like a CV entry), the author list with
     the site owner's name emphasised, a muted venue line with an optional
     note pill ("Spotlight", "Best paper", …), and link pills (DOI, arXiv,
     PDF, …) plus a "Project page" pill when the entry names a project id.

   data/papers.json shape:
   {
     "sections": [
       {
         "id": "conference",               // used for the section's anchor
         "title": "Conference papers",
         "entries": [
           {
             "title":   "Paper title",
             "authors": ["Gaurab Pokharel", "Coauthor", "…"],  // in order
             "venue":   "Venue name (VENUE YEAR), city, pages",
             "year":    "2026",             // optional, shown on the right
             "note":    "Spotlight",        // optional, shown as a pill
             "links":   [ { "label": "DOI", "url": "https://…" } ],
             "project": "kebab-id"          // optional, links project.html
           }
         ]
       }
     ]
   }

   All JSON values are inserted as plain text (textContent / createTextNode,
   never innerHTML), so the data can't inject markup. The one deliberate
   exception mirrors cv.js: exact occurrences of the owner's name in the
   author list are wrapped in <strong>.

   Depends on window.fetchJSON from assets/js/site.js.
   ========================================================================== */

(function () {
  "use strict";

  const DATA_PATH = "data/papers.json";
  const AUTHOR_NAME = "Gaurab Pokharel";

  const container = document.getElementById("papers-sections");
  const note = document.getElementById("papers-note");

  // Loaded on the wrong page (or the hook was removed): do nothing.
  if (!container) return;

  init();

  async function init() {
    if (typeof window.fetchJSON !== "function") {
      console.error("papers.js: window.fetchJSON missing — assets/js/site.js must load first.");
      fail("Papers could not be loaded.");
      return;
    }

    let data;
    try {
      data = await window.fetchJSON(DATA_PATH);
    } catch (error) {
      // Typical causes: a network hiccup, or the page opened via file://
      // where browsers block fetch. Keep the visible note generic and put
      // the detail in the console, matching the other page scripts.
      console.error("papers.js: could not load " + DATA_PATH + " —", error);
      fail("Papers could not be loaded right now.");
      return;
    }

    const sections = (data && Array.isArray(data.sections) ? data.sections : [])
      .filter(function (section) {
        return section && Array.isArray(section.entries) && section.entries.length > 0;
      });

    if (sections.length === 0) {
      fail("No papers to show yet.");
      return;
    }

    const fragment = document.createDocumentFragment();
    sections.forEach(function (section) {
      fragment.appendChild(renderSection(section));
    });

    container.textContent = ""; // drops the "Loading…" line; idempotent if re-run
    container.appendChild(fragment);
  }

  /* ------------------------------------------------------------------------ */
  /* Rendering                                                                 */
  /* ------------------------------------------------------------------------ */

  /* Create an element with an optional class and plain-text content. */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  /* A section: heading (anchored by id) over a list of entries. */
  function renderSection(section) {
    const wrapper = el("section", "papers-section");
    const slug = slugify(section.id || section.title);
    if (slug) wrapper.id = slug;

    if (section.title) {
      const heading = el("h2", "papers-section-title", section.title);
      if (slug) {
        heading.id = slug + "-heading";
        wrapper.setAttribute("aria-labelledby", heading.id);
      }
      wrapper.appendChild(heading);
    }

    const list = el("ol", "papers-list");
    section.entries.forEach(function (entry) {
      if (entry && entry.title) list.appendChild(renderEntry(entry));
    });
    wrapper.appendChild(list);
    return wrapper;
  }

  /* One paper: title, authors, venue (+ note), year, link pills. */
  function renderEntry(entry) {
    const item = el("li", "paper");

    // Head row: title and authors on the left, year on the right.
    const head = el("div", "paper-head");
    const main = el("div", "paper-main");

    main.appendChild(el("h3", "paper-title", entry.title));

    const authors = formatAuthors(entry.authors);
    if (authors) {
      const line = el("p", "paper-authors");
      appendTextWithBoldName(line, authors);
      main.appendChild(line);
    }

    head.appendChild(main);
    if (entry.year) head.appendChild(el("p", "paper-year", entry.year));
    item.appendChild(head);

    // Venue line with the optional note pill after it.
    if (entry.venue || entry.note) {
      const venue = el("p", "paper-venue");
      if (entry.venue) venue.appendChild(document.createTextNode(String(entry.venue)));
      if (entry.note) {
        if (entry.venue) venue.appendChild(document.createTextNode(" "));
        venue.appendChild(el("span", "tag paper-note", entry.note));
      }
      item.appendChild(venue);
    }

    // Links: the entry's own, then the project page when one is named.
    const links = normalizeLinks(entry.links);
    if (entry.project) {
      links.push({
        label: "Project page",
        url: "project.html?id=" + encodeURIComponent(String(entry.project))
      });
    }
    if (links.length > 0) {
      const wrap = el("div", "paper-links");
      links.forEach(function (link) {
        const anchor = el("a", "paper-link", link.label);
        anchor.setAttribute("href", link.url);
        wrap.appendChild(anchor);
      });
      item.appendChild(wrap);
    }

    return item;
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                   */
  /* ------------------------------------------------------------------------ */

  /* Join an author array the way a reference list would:
     "A", "A and B", "A, B, and C". A plain string passes through. */
  function formatAuthors(authors) {
    if (typeof authors === "string") return authors.trim();
    if (!Array.isArray(authors)) return "";
    const names = authors
      .map(function (name) { return String(name || "").trim(); })
      .filter(Boolean);
    if (names.length === 0) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + " and " + names[1];
    return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
  }

  /* Append text to a parent, wrapping the owner's name in <strong>. */
  function appendTextWithBoldName(parent, text) {
    const parts = String(text).split(AUTHOR_NAME);
    parts.forEach(function (part, index) {
      if (index > 0) parent.appendChild(el("strong", "", AUTHOR_NAME));
      if (part) parent.appendChild(document.createTextNode(part));
    });
  }

  /* Keep only links that have a URL; default the label. */
  function normalizeLinks(links) {
    if (!Array.isArray(links)) return [];
    return links
      .filter(function (link) { return link && link.url; })
      .map(function (link) {
        return { label: link.label || "Link", url: String(link.url) };
      });
  }

  /* "Conference papers" → "conference-papers"; used for section anchors. */
  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* Replace the loading line with a quiet note. */
  function fail(message) {
    container.textContent = "";
    if (!note) return;
    note.textContent = message;
    note.hidden = false;
  }
})();
