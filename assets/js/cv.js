/* assets/js/cv.js
   CV page. Loads data/cv.json and renders the sections in the order they
   appear in the file. Relies on the helpers site.js exposes on window:
   fetchJSON(path) and formatDate(isoString).

   data/cv.json shape:
   {
     "pdf": "assets/files/cv.pdf",
     "updated": "2026-07-06",                        // optional
     "sections": [
       {
         "title": "Education",
         "entries": [
           {
             "primary":   "PhD, Computer Science",   // optional — prominent line
             "secondary": "Virginia Tech",           // optional — muted line
             "date":      "2024 – present",          // optional — right-aligned
             "detail":    "GPA: 3.96/4.0",           // optional — string OR array
                                                     //   of strings (bullet list)
             "links":     [ { "label": "DOI", "url": "…" } ],  // optional
             "link":      "https://…"                // optional — single-URL form,
                                                     //   rendered with label "Link"
           }
         ]
       }
     ]
   }

   All JSON values are inserted as plain text (textContent / createTextNode,
   never innerHTML), so data can't inject markup. The one deliberate
   exception: exact occurrences of "Gaurab Pokharel" in a secondary line are
   wrapped in a <strong> element so the name reads bold in author lists. */

(function () {
  "use strict";

  var DATA_PATH = "data/cv.json";
  var FALLBACK_PDF = "assets/files/cv.pdf";
  var AUTHOR_NAME = "Gaurab Pokharel";

  /* ---- tiny DOM helpers ------------------------------------------------ */

  /* Create an element with an optional class and plain-text content. */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  /* Append text to a parent, wrapping the author's name in <strong>. */
  function appendTextWithBoldName(parent, text) {
    var parts = String(text).split(AUTHOR_NAME);
    for (var i = 0; i < parts.length; i++) {
      if (i > 0) parent.appendChild(el("strong", "", AUTHOR_NAME));
      if (parts[i]) parent.appendChild(document.createTextNode(parts[i]));
    }
  }

  /* ---- rendering --------------------------------------------------------- */

  /* Accept both the `links` array form and the legacy single `link` string. */
  function normalizeLinks(entry) {
    var links = [];
    if (Array.isArray(entry.links)) {
      entry.links.forEach(function (item) {
        if (item && item.url) {
          links.push({ label: item.label || "Link", url: item.url });
        }
      });
    }
    if (typeof entry.link === "string" && entry.link) {
      links.push({ label: "Link", url: entry.link });
    }
    return links;
  }

  function renderEntry(entry) {
    var item = el("li", "cv-entry");

    /* Head row: primary + secondary on the left, date on the right. */
    var head = el("div", "cv-entry-head");
    var main = el("div", "cv-entry-main");

    if (entry.primary) {
      main.appendChild(el("h3", "cv-primary", entry.primary));
    }
    if (entry.secondary) {
      var secondary = el("p", "cv-secondary");
      appendTextWithBoldName(secondary, entry.secondary);
      main.appendChild(secondary);
    }

    head.appendChild(main);
    if (entry.date) head.appendChild(el("p", "cv-date", entry.date));

    /* Skip the head row entirely for entries that have none of it
       (e.g. the research-interests bullet list). */
    if (main.childNodes.length > 0 || entry.date) item.appendChild(head);

    /* Detail: a single line, or an array rendered as a bullet list. */
    if (Array.isArray(entry.detail)) {
      var list = el("ul", "cv-detail-list");
      entry.detail.forEach(function (line) {
        list.appendChild(el("li", "", line));
      });
      item.appendChild(list);
    } else if (entry.detail) {
      item.appendChild(el("p", "cv-detail", entry.detail));
    }

    /* Links (DOI, arXiv, Details, …) as small pills. */
    var links = normalizeLinks(entry);
    if (links.length > 0) {
      var wrap = el("div", "cv-links");
      links.forEach(function (link) {
        var anchor = el("a", "cv-link", link.label);
        anchor.setAttribute("href", link.url);
        wrap.appendChild(anchor);
      });
      item.appendChild(wrap);
    }

    return item;
  }

  function renderSection(section) {
    var wrapper = el("section", "cv-section");
    if (section.title) {
      wrapper.appendChild(el("h2", "cv-section-title", section.title));
    }
    var list = el("ul", "cv-entries");
    (section.entries || []).forEach(function (entry) {
      list.appendChild(renderEntry(entry));
    });
    wrapper.appendChild(list);
    return wrapper;
  }

  function renderError(container) {
    container.textContent = "";
    var message = el("p", "cv-error", "Sorry — the CV could not be loaded right now. ");
    var fallback = el("a", "", "Download the PDF version instead.");
    fallback.setAttribute("href", FALLBACK_PDF);
    message.appendChild(fallback);
    container.appendChild(message);
  }

  /* ---- page init --------------------------------------------------------- */

  async function init() {
    var container = document.getElementById("cv-sections");
    if (!container) return;

    var loadJSON = window.fetchJSON || async function (path) {
      var response = await fetch(path);
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    };

    try {
      var data = await loadJSON(DATA_PATH);

      /* Point the download button at the path declared in cv.json. */
      var pdfPath = data.pdf || FALLBACK_PDF;
      document.querySelectorAll(".cv-download").forEach(function (button) {
        button.setAttribute("href", pdfPath);
      });

      /* Optional "last updated" line under the heading. */
      var updated = document.getElementById("cv-updated");
      if (updated && data.updated) {
        var pretty = window.formatDate ? window.formatDate(data.updated) : data.updated;
        updated.textContent = "Last updated " + pretty;
        updated.hidden = false;
      }

      /* Render every section, in file order. */
      container.textContent = "";
      (data.sections || []).forEach(function (section) {
        container.appendChild(renderSection(section));
      });
    } catch (error) {
      renderError(container);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
