/* project.js — single project detail page.
 *
 * Reads the `id` query parameter, finds the matching entry in
 * data/projects.json, and renders the project header (title, period,
 * status, tags, links). If the project declares a `body`, the matching
 * Markdown file in data/projects/ is fetched and rendered with `marked`,
 * a small parser pinned to a fixed CDN version and loaded only on this
 * page, and only when a body actually exists.
 *
 * Everything except the back link is rendered inside a .project-panel —
 * a rounded, slightly sunken box that anchors the content against the
 * page background. The back link sits above the panel as navigation.
 *
 * After the write-up, a centered PDF badge links to the paper (arXiv,
 * DOI, or a local PDF), taken from the project's first "Paper"-like link.
 *
 * Depends on the helpers exposed by site.js: fetchJSON(path) and
 * getParam(name).
 */
(function () {
  "use strict";

  /* The one allowed external runtime dependency, pinned. Injected lazily
     so projects without a write-up never download it. */
  var MARKED_CDN = "https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js";

  var main = document.getElementById("content");

  /* ------------------------------------------------------------------ *
   * Small DOM helpers                                                    *
   * ------------------------------------------------------------------ */

  /** Create an element with an optional class and text content. */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /** Back link to the projects index, used in both success and error states. */
  function backLink() {
    var link = el("a", "back-link", "← All projects");
    link.href = "projects.html";
    return link;
  }

  /** Replace main with a friendly "not found" message, boxed like the
      normal page so the error state still looks intentional. */
  function renderError(heading, message) {
    main.innerHTML = "";
    var section = el("section", "section");
    var container = el("div", "container");
    var panel = el("div", "project-panel prose");
    panel.appendChild(el("h1", null, heading));
    panel.appendChild(el("p", null, message));
    var p = el("p");
    p.appendChild(backLink());
    panel.appendChild(p);
    container.appendChild(panel);
    section.appendChild(container);
    main.appendChild(section);
    document.title = "Project not found · Gaurab Pokharel";
  }

  /* ------------------------------------------------------------------ *
   * Markdown support                                                     *
   * ------------------------------------------------------------------ */

  /** Load the pinned Markdown parser on demand; resolves with window.marked. */
  function loadMarked() {
    if (window.marked && typeof window.marked.parse === "function") {
      return Promise.resolve(window.marked);
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = MARKED_CDN;
      script.onload = function () {
        if (window.marked && typeof window.marked.parse === "function") {
          resolve(window.marked);
        } else {
          reject(new Error("Markdown parser unavailable"));
        }
      };
      script.onerror = function () {
        reject(new Error("Failed to load Markdown parser"));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Conservative clean-up of parser output before it is inserted.
   * The Markdown is authored in this repository, so this is a guard
   * rail rather than a full sanitizer: it strips active content
   * (scripts, embeds, event handlers, javascript: URLs) and inline
   * style attributes — all styling must come from main.css. It also
   * makes sure every write-up image is lazy-loaded.
   */
  function sanitizeHTML(html) {
    var template = document.createElement("template");
    template.innerHTML = html;

    template.content
      .querySelectorAll("script, style, iframe, object, embed, form")
      .forEach(function (node) { node.remove(); });

    template.content.querySelectorAll("*").forEach(function (node) {
      Array.prototype.slice.call(node.attributes).forEach(function (attr) {
        var name = attr.name.toLowerCase();
        var value = String(attr.value).trim().toLowerCase();
        if (name.indexOf("on") === 0 || name === "style") {
          node.removeAttribute(attr.name);
        } else if ((name === "href" || name === "src" || name === "xlink:href") &&
                   value.indexOf("javascript:") === 0) {
          node.removeAttribute(attr.name);
        }
      });
    });

    template.content.querySelectorAll("img").forEach(function (img) {
      if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
    });

    return template.innerHTML;
  }

  /** Fetch and render the project's Markdown write-up into `target`. */
  function renderBody(bodyId, target) {
    var path = "data/projects/" + encodeURIComponent(bodyId) + ".md";
    return fetch(path)
      .then(function (response) {
        if (!response.ok) throw new Error("Could not fetch " + path);
        return response.text();
      })
      .then(function (markdown) {
        return loadMarked().then(function (marked) {
          target.innerHTML = sanitizeHTML(marked.parse(markdown));
        }).catch(function () {
          /* Parser failed to load: degrade to the raw text so the
             write-up is still readable rather than lost. */
          target.textContent = markdown;
        });
      })
      .catch(function () {
        target.textContent = "The full write-up could not be loaded right now.";
      });
  }

  /* ------------------------------------------------------------------ *
   * Paper badge                                                          *
   * ------------------------------------------------------------------ */

  /** Pick the link that points at the paper itself, if there is one. */
  function paperLink(project) {
    var links = (project.links || []).filter(function (item) {
      return item && item.url;
    });
    return links.find(function (item) {
      return /paper|pdf|thesis/i.test(item.label || "");
    }) || null;
  }

  /* Inline document icon; static markup, no external image needed. */
  var PDF_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true" focusable="false">' +
    '<path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" ' +
    'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<path d="M15 2v5h5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<text x="12" y="17" text-anchor="middle" font-size="6.5" font-weight="600" ' +
    'fill="currentColor">PDF</text>' +
    "</svg>";

  /** Centered PDF badge at the bottom of the panel, linking to the paper. */
  function renderPaperBadge(project, parent) {
    var paper = paperLink(project);
    if (!paper) return;

    var wrap = el("p", "paper-badge");
    var anchor = document.createElement("a");
    anchor.className = "paper-badge-link";
    anchor.href = paper.url;
    anchor.setAttribute("aria-label", "Open the paper as a PDF");
    /* External pages and PDF files open in a new tab so the reader
       keeps their place on the site. */
    if (/^https?:\/\//i.test(paper.url) || /\.pdf(\?|#|$)/i.test(paper.url)) {
      anchor.target = "_blank";
      anchor.rel = "noopener";
    }
    anchor.innerHTML = PDF_ICON_SVG;
    anchor.appendChild(el("span", "paper-badge-label", "Paper (PDF)"));
    wrap.appendChild(anchor);
    parent.appendChild(wrap);
  }

  /* ------------------------------------------------------------------ *
   * Page rendering                                                       *
   * ------------------------------------------------------------------ */

  /** Render the project header and, when present, kick off the body load. */
  function renderProject(project) {
    document.title = project.title + " · Gaurab Pokharel";

    /* Reuse the summary as the page description when one exists. */
    var description = document.querySelector('meta[name="description"]');
    if (description && project.summary) {
      description.setAttribute("content", project.summary);
    }

    main.innerHTML = "";
    var section = el("section", "section");
    var container = el("div", "container");
    var article = el("article", "project-detail");

    /* Back link above the panel so it reads as navigation, not content,
       and is the first thing in reading and tab order. */
    var nav = el("p", "project-backnav");
    nav.appendChild(backLink());
    article.appendChild(nav);

    /* Everything else lives inside the sunken panel. */
    var panel = el("div", "project-panel");

    var header = el("header", "project-header");
    header.appendChild(el("h1", null, project.title));

    /* Period and status on one muted line, e.g. "2024 · Current". */
    var metaBits = [];
    if (project.period) metaBits.push(project.period);
    if (project.status) {
      metaBits.push(project.status.charAt(0).toUpperCase() + project.status.slice(1));
    }
    if (metaBits.length) {
      header.appendChild(el("p", "project-meta", metaBits.join(" · ")));
    }

    /* Tags as a plain list. */
    if (Array.isArray(project.tags) && project.tags.length) {
      var tagList = el("ul", "tag-list");
      tagList.setAttribute("aria-label", "Topics");
      project.tags.forEach(function (tag) {
        tagList.appendChild(el("li", "tag", tag));
      });
      header.appendChild(tagList);
    }

    /* Link buttons for papers, code, and so on. Entries without a URL
       are skipped rather than rendered as dead buttons. */
    var links = (project.links || []).filter(function (item) {
      return item && item.url;
    });
    if (links.length) {
      var linkList = el("ul", "project-links");
      linkList.setAttribute("aria-label", "Project links");
      links.forEach(function (item) {
        var li = el("li");
        var anchor = el("a", "btn", item.label || "Link");
        anchor.href = item.url;
        if (/^https?:\/\//i.test(item.url)) {
          anchor.target = "_blank";
          anchor.rel = "noopener";
        }
        li.appendChild(anchor);
        linkList.appendChild(li);
      });
      header.appendChild(linkList);
    }

    panel.appendChild(header);

    /* Optional Markdown write-up. */
    if (project.body) {
      var body = el("div", "prose project-body");
      body.setAttribute("aria-busy", "true");
      body.appendChild(el("p", "project-body-loading", "Loading write-up…"));
      panel.appendChild(body);

      renderBody(project.body, body).then(function () {
        body.removeAttribute("aria-busy");
      });
    }

    /* Centered PDF badge at the very bottom of the panel. It is
       appended now (the write-up streams into the div above it). */
    renderPaperBadge(project, panel);

    article.appendChild(panel);
    container.appendChild(article);
    section.appendChild(container);
    main.appendChild(section);
  }

  /* ------------------------------------------------------------------ *
   * Entry point                                                          *
   * ------------------------------------------------------------------ */

  function init() {
    var id = getParam("id");
    if (!id) {
      renderError(
        "No project selected",
        "This page shows a single project, but no project was specified in the address."
      );
      return;
    }

    fetchJSON("data/projects.json")
      .then(function (projects) {
        var project = (projects || []).find(function (item) {
          return item && item.id === id;
        });
        if (!project) {
          renderError(
            "Project not found",
            "There is no project with the id “" + id + "”. It may have been renamed or removed."
          );
          return;
        }
        renderProject(project);
      })
      .catch(function () {
        renderError(
          "Something went wrong",
          "The project list could not be loaded. Please try again in a moment."
        );
      });
  }

  init();
})();