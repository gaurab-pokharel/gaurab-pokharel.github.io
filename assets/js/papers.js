/* ==========================================================================
   papers.js — Papers page, loaded after site.js on papers.html only.

   Reads update/papers.json and renders each section (conference papers,
   preprints, extended abstracts) in file order, with its name in the left
   margin and the papers beside it. Entries also stay in file order, so the
   file controls the ordering: keep it newest first. A section marked
   "listed": false is left off this page.

   One entry shows: the title, the author list with the site owner's name
   emphasised, the venue line with an optional pill ("Spotlight"), and a row
   of links (arXiv, DOI, any extras, and "Project page" when the entry names
   a project). The venue line and the links are built from the entry's
   fields by Site.papers, the same helpers the home page, the CV and the
   project pages use.

   All values are inserted as plain text, so the data cannot inject markup.
   ========================================================================== */

(function () {
  "use strict";

  const Site = window.Site;
  const container = document.getElementById("papers-sections");
  const note = document.getElementById("papers-note");

  // Loaded on the wrong page, or site.js is missing: do nothing.
  if (!container) return;
  if (!Site) {
    console.error("papers.js: window.Site missing. assets/js/site.js must load first.");
    return;
  }
  const el = Site.el;

  init();

  async function init() {
    let data, site;
    try {
      [data, site] = await Promise.all([Site.fetchJSON(Site.paths.papers), Site.loadSite()]);
    } catch (error) {
      fail("Papers could not be loaded right now.");
      return;
    }

    const sections = (data && Array.isArray(data.sections) ? data.sections : [])
      .filter(function (section) {
        return section && section.listed !== false &&
          Array.isArray(section.entries) && section.entries.length > 0;
      });

    if (sections.length === 0) {
      fail("No papers to show yet.");
      return;
    }

    const fragment = document.createDocumentFragment();
    sections.forEach(function (section) {
      fragment.appendChild(renderSection(section, site.name || ""));
    });
    container.textContent = ""; // drops the "Loading" line
    container.appendChild(fragment);
  }

  /* A section: its name in the left margin, the list of papers beside it. */
  function renderSection(section, owner) {
    const slug = slugify(section.id || section.title);
    const wrapper = el("section", "band");
    const inner = el("div", "container band-inner");

    const heading = el("h2", "band-label", section.title || "");
    if (slug) {
      wrapper.id = slug;
      heading.id = slug + "-heading";
      wrapper.setAttribute("aria-labelledby", heading.id);
    }
    inner.appendChild(heading);

    const body = el("div", "band-body");
    const list = el("ol", "paper-list");
    section.entries.forEach(function (paper) {
      if (paper && paper.title) list.appendChild(renderPaper(paper, owner));
    });
    body.appendChild(list);
    inner.appendChild(body);
    wrapper.appendChild(inner);
    return wrapper;
  }

  /* One paper: title, authors, venue (+ pill), links. */
  function renderPaper(paper, owner) {
    const item = el("li", "paper");
    item.appendChild(Site.keepCompounds(el("h3", "paper-title", paper.title)));

    if (paper.authors && paper.authors.length) {
      item.appendChild(Site.papers.appendAuthors(el("p", "paper-authors"), paper, owner));
    }

    const venueText = Site.papers.venueLine(paper);
    if (venueText || paper.note) {
      const venue = el("p", "paper-venue");
      if (venueText) venue.appendChild(el("span", "", venueText));
      if (paper.note) venue.appendChild(el("span", "pill", paper.note));
      item.appendChild(venue);
    }

    const links = Site.papers.links(paper);
    if (paper.project) {
      links.push({ label: "Project page", url: "project.html?id=" + encodeURIComponent(paper.project) });
    }
    if (links.length) {
      const row = el("p", "link-row");
      links.forEach(function (link) {
        row.appendChild(Site.setLink(el("a", "", link.label), link.url));
      });
      item.appendChild(row);
    }
    return item;
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
