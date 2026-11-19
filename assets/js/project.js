/* ==========================================================================
   project.js — single project page, loaded after site.js on project.html.

   Reads the `id` query parameter (project.html?id=<id>) and assembles the
   page from three places in update/:
   • projects.json     title, year, status, one-line summary, topics
   • papers.json       the paper that names this project: authors, venue,
                       links, the citation and the funding note
   • projects/<id>/    writeup.md (the write-up) and its figures

   Every project page has the same order:
     1. back link, year and status, title, summary
     2. details: authors and affiliations, venue, topics, links
     3. the write-up, rendered from Markdown
     4. the citation (BibTeX generated from the paper entry) and funding

   Nothing about a paper is typed into the write-up itself, so when a paper
   is accepted only update/papers.json changes.

   The Markdown is rendered with `marked`, a small parser pinned to a fixed
   CDN version. It is the site's one external script and is loaded only on
   this page, and only when a write-up exists. Figures are written with a
   bare file name (src="fig1.png"); this script points them at the
   project's own folder.
   ========================================================================== */

(function () {
  "use strict";

  const Site = window.Site;
  const main = document.getElementById("content");
  if (!main) return;
  if (!Site) {
    console.error("project.js: window.Site missing. assets/js/site.js must load first.");
    return;
  }
  const el = Site.el;

  /* The one allowed external runtime dependency, pinned. */
  const MARKED_CDN = "https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js";

  init();

  async function init() {
    const id = Site.getParam("id");
    if (!id) {
      renderError(
        "No project selected",
        "This page shows a single project, but no project was named in the address."
      );
      return;
    }

    // Start everything at once; only the project list is essential.
    const papersRequest = Site.fetchJSON(Site.paths.papers).catch(function () { return null; });
    const siteRequest = Site.loadSite();

    let projects;
    try {
      projects = await Site.fetchJSON(Site.paths.projects);
    } catch (error) {
      renderError(
        "Something went wrong",
        "The project list could not be loaded. Please try again in a moment."
      );
      return;
    }

    const project = (Array.isArray(projects) ? projects : []).find(function (item) {
      return item && item.id === id;
    });
    if (!project) {
      renderError(
        "Project not found",
        "There is no project with the id “" + id + "”. It may have been renamed or removed."
      );
      return;
    }

    const papersData = await papersRequest;
    const site = await siteRequest;
    const papers = papersData ? Site.papers.forProject(papersData, id) : [];
    renderProject(project, papers, site);
  }

  /* ---------------------------------------------------------------------- */
  /* Page                                                                    */
  /* ---------------------------------------------------------------------- */

  function renderProject(project, papers, site) {
    document.title = (project.title || project.id) + " · " + (site.name || "Gaurab Pokharel");

    // Reuse the summary as the page description when one exists.
    const description = document.querySelector('meta[name="description"]');
    if (description && project.summary) description.setAttribute("content", project.summary);

    const article = el("article", "project");

    // The heading sits in a band that spans the full width of the window,
    // so that dots.js can draw the dot grid behind it.
    const headBand = el("div", "dot-band");
    headBand.setAttribute("data-dots", "project");
    headBand.appendChild(renderHead(project));
    article.appendChild(headBand);

    const details = renderDetails(project, papers, site);
    if (details) article.appendChild(details);

    const paper = papers[0] || null;
    const hasWriteup = project.writeup !== false;
    if (hasWriteup || paper) {
      const band = el("section", "band");
      const inner = el("div", "container band-inner");
      const body = el("div", "band-body");

      if (hasWriteup) {
        const writeup = el("div", "project-body");
        writeup.setAttribute("aria-busy", "true");
        writeup.appendChild(el("p", "project-loading", "Loading write-up…"));
        body.appendChild(writeup);
        renderWriteup(project, writeup).then(function () {
          writeup.removeAttribute("aria-busy");
        });
      }
      if (paper) body.appendChild(renderCitation(paper, !hasWriteup));

      inner.appendChild(body);
      band.appendChild(inner);
      article.appendChild(band);
    }

    main.textContent = "";
    main.appendChild(article);
  }

  /** Back link to the projects page, used in both normal and error states. */
  function backLink() {
    const link = el("a", "back-link");
    link.href = "projects.html";
    const arrow = el("span", "", "←");
    arrow.setAttribute("aria-hidden", "true");
    link.appendChild(arrow);
    link.appendChild(document.createTextNode("All projects"));
    return link;
  }

  /** Back link, "2026 · Current project", title, one-line summary. */
  function renderHead(project) {
    const head = el("header", "project-head container");
    head.appendChild(backLink());

    const status = String(project.status || "").trim().toLowerCase() === "current"
      ? "Current project" : "Past project";
    head.appendChild(el("p", "project-meta", [project.period, status].filter(Boolean).join(" · ")));
    head.appendChild(Site.keepCompounds(el("h1", "", project.title || project.id)));
    if (project.summary) head.appendChild(el("p", "project-lede", project.summary));
    return head;
  }

  /* ---------------------------------------------------------------------- */
  /* Details block                                                           */
  /* ---------------------------------------------------------------------- */

  /** One labelled row of the details block. */
  function detailRow(label, value) {
    const row = el("div", "detail-row");
    row.appendChild(el("dt", "", label));
    const dd = el("dd");
    dd.appendChild(value);
    row.appendChild(dd);
    return row;
  }

  /**
   * Number each author's affiliation. An affiliation comes from the paper
   * entry's own "affiliations" map when it has one, otherwise from the
   * shared map in update/site.json. Returns { marks: {name: "1"}, list,
   * plain }, where plain means no numbering is needed.
   */
  function affiliationMarks(paper, site) {
    const own = paper.affiliations || {};
    const shared = (site && site.affiliations) || {};
    const list = [];
    const marks = {};
    (Array.isArray(paper.authors) ? paper.authors : []).forEach(function (name) {
      const place = own[name] || shared[name];
      if (!place) return;
      let index = list.indexOf(place);
      if (index === -1) {
        list.push(place);
        index = list.length - 1;
      }
      marks[name] = String(index + 1);
    });
    // When every author shares one affiliation, numbering adds nothing:
    // show the names plainly with the affiliation underneath.
    const authors = Array.isArray(paper.authors) ? paper.authors : [];
    if (list.length === 1 && authors.every(function (name) { return marks[name]; })) {
      return { marks: {}, list: list, plain: true };
    }
    return { marks: marks, list: list, plain: false };
  }

  function renderDetails(project, papers, site) {
    const paper = papers[0] || null;
    const rows = [];

    if (paper && paper.authors && paper.authors.length) {
      const value = document.createDocumentFragment();
      const affiliations = affiliationMarks(paper, site);
      const names = el("p");
      Site.papers.appendAuthors(names, paper, site.name || "", {
        marks: affiliations.marks,
        skipEqualNote: true
      });
      value.appendChild(names);

      // "1 Virginia Tech, 2 Washington University in St. Louis · *Equal contribution"
      const equal = Array.isArray(paper.equal) && paper.equal.length > 0;
      if (affiliations.list.length || equal) {
        const sub = el("p", "detail-sub");
        affiliations.list.forEach(function (place, index) {
          if (index > 0) sub.appendChild(document.createTextNode(", "));
          if (!affiliations.plain) sub.appendChild(el("sup", "", String(index + 1)));
          sub.appendChild(document.createTextNode(place));
        });
        if (equal) {
          sub.appendChild(document.createTextNode((affiliations.list.length ? " · " : "") + "*Equal contribution"));
        }
        value.appendChild(sub);
      }
      rows.push(detailRow(paper.authors.length > 1 ? "Authors" : "Author", value));
    }

    if (paper) {
      const venueText = Site.papers.venueLine(paper);
      if (venueText || paper.note) {
        const venue = el("p", "detail-venue");
        if (venueText) venue.appendChild(el("span", "", venueText));
        if (paper.note) venue.appendChild(el("span", "pill", paper.note));
        rows.push(detailRow(/thesis/i.test(paper.venue || "") ? "Type" : "Venue", venue));
      }
    }

    const tags = (Array.isArray(project.tags) ? project.tags : []).filter(Boolean);
    if (tags.length) rows.push(detailRow("Topics", el("p", "", tags.join(" · "))));

    const links = renderLinks(project, papers);
    if (links) rows.push(detailRow("Links", links));

    if (rows.length === 0) return null;
    const band = el("section", "band");
    band.setAttribute("aria-label", "Project details");
    const list = el("dl", "detail-list container");
    rows.forEach(function (row) { list.appendChild(row); });
    band.appendChild(list);
    return band;
  }

  /** "Read the paper" as the one filled button, then every other link. */
  function renderLinks(project, papers) {
    const wrap = el("div", "detail-links");
    const paper = papers[0] || null;

    if (paper) {
      const primary = Site.papers.primaryLink(paper);
      if (primary) {
        const label = /thesis/i.test(paper.venue || "") ? "Read the thesis" : "Read the paper";
        wrap.appendChild(Site.setLink(el("a", "btn btn--small", label), primary.url));
      }
      Site.papers.links(paper).forEach(function (link) {
        if (primary && link.url === primary.url) return;
        wrap.appendChild(Site.setLink(el("a", "", link.label), link.url));
      });
    }

    // A project with more than one paper links the others by venue.
    papers.slice(1).forEach(function (other) {
      const link = Site.papers.primaryLink(other);
      if (link) {
        wrap.appendChild(Site.setLink(el("a", "", "Paper (" + Site.papers.shortVenue(other) + ")"), link.url));
      }
    });

    // Extra links on the project entry itself, e.g. Code.
    (Array.isArray(project.links) ? project.links : []).forEach(function (link) {
      if (link && link.url) {
        wrap.appendChild(Site.setLink(el("a", "", link.label || "Link"), String(link.url)));
      }
    });

    return wrap.childNodes.length ? wrap : null;
  }

  /* ---------------------------------------------------------------------- */
  /* Write-up (Markdown)                                                     */
  /* ---------------------------------------------------------------------- */

  /** Load the pinned Markdown parser on demand; resolves with window.marked. */
  function loadMarked() {
    if (window.marked && typeof window.marked.parse === "function") {
      return Promise.resolve(window.marked);
    }
    return new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = MARKED_CDN;
      script.onload = function () {
        if (window.marked && typeof window.marked.parse === "function") resolve(window.marked);
        else reject(new Error("Markdown parser unavailable"));
      };
      script.onerror = function () { reject(new Error("Failed to load Markdown parser")); };
      document.head.appendChild(script);
    });
  }

  /** True for a bare file name or relative path inside the project folder. */
  function isLocalFile(url) {
    return !!url &&
      !/^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(url) && // not absolute, anchored or a query
      !/^(update|assets)\//.test(url) &&            // not already a site path
      !/\.html?([?#]|$)/i.test(url);                // not one of the site's pages
  }

  /**
   * Clean up the parser's output before it is inserted. The Markdown is
   * written in this repository, so this is a guard rail, not a full
   * sanitizer: it strips active content (scripts, embeds, event handlers,
   * javascript: URLs) and inline style attributes, since all styling comes
   * from main.css. It also points figures and file links at the project's
   * folder, lazy-loads images, links each figure to its full-size image and
   * opens external links in a new tab.
   */
  function cleanHTML(html, folder) {
    const template = document.createElement("template");
    template.innerHTML = html;

    template.content
      .querySelectorAll("script, style, iframe, object, embed, form")
      .forEach(function (node) { node.remove(); });

    template.content.querySelectorAll("*").forEach(function (node) {
      Array.prototype.slice.call(node.attributes).forEach(function (attr) {
        const name = attr.name.toLowerCase();
        const value = String(attr.value).trim().toLowerCase();
        if (name.indexOf("on") === 0 || name === "style") {
          node.removeAttribute(attr.name);
        } else if ((name === "href" || name === "src" || name === "xlink:href") &&
                   value.indexOf("javascript:") === 0) {
          node.removeAttribute(attr.name);
        }
      });
    });

    template.content.querySelectorAll("img").forEach(function (img) {
      const src = img.getAttribute("src");
      if (isLocalFile(src)) img.setAttribute("src", folder + src);
      if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    });

    // Let readers open a figure at full size: wrap each figure image in a
    // link to the image file, unless the write-up already links it.
    template.content.querySelectorAll("figure img").forEach(function (img) {
      if (img.closest("a") || !img.getAttribute("src")) return;
      const link = document.createElement("a");
      link.className = "figure-link";
      link.setAttribute("href", img.getAttribute("src"));
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
      img.parentNode.insertBefore(link, img);
      link.appendChild(img);
    });

    template.content.querySelectorAll("a[href]").forEach(function (anchor) {
      const href = anchor.getAttribute("href");
      if (isLocalFile(href)) anchor.setAttribute("href", folder + href);
      if (Site.isExternal(href)) {
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener");
      }
    });

    return template.innerHTML;
  }

  /** Fetch and render update/projects/<id>/writeup.md into `target`. */
  function renderWriteup(project, target) {
    const folder = Site.paths.projectDir(project.id);
    const path = folder + (typeof project.writeup === "string" ? project.writeup : "writeup.md");

    return fetch(path)
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load " + path + " (HTTP " + response.status + ")");
        return response.text();
      })
      .then(function (markdown) {
        return loadMarked().then(function (marked) {
          target.innerHTML = cleanHTML(marked.parse(markdown), folder);
        }).catch(function () {
          // The parser did not load: show the raw text so the write-up is
          // still readable instead of lost.
          target.textContent = markdown;
        });
      })
      .catch(function (error) {
        Site.reportDataError(error.message);
        target.textContent = "";
        target.appendChild(el("p", "project-loading", "The write-up could not be loaded right now."));
      });
  }

  /* ---------------------------------------------------------------------- */
  /* Citation                                                                */
  /* ---------------------------------------------------------------------- */

  /** BibTeX generated from the paper entry, a copy button, the funding note. */
  function renderCitation(paper, isFirst) {
    const section = el("section", "citation");
    if (isFirst) section.classList.add("citation--first");
    section.appendChild(el("h2", "", "Citation"));

    const box = el("div", "bibtex");
    const bar = el("div", "bibtex-bar");
    bar.appendChild(el("span", "", "BibTeX"));
    const button = el("button", "copy-btn", "Copy");
    button.type = "button";
    bar.appendChild(button);
    box.appendChild(bar);

    const pre = el("pre");
    pre.tabIndex = 0; // lets keyboard users scroll a long line
    pre.setAttribute("role", "group"); // gives the label below a role to attach to
    pre.setAttribute("aria-label", "BibTeX citation");
    const code = el("code", "", Site.papers.bibtex(paper));
    pre.appendChild(code);
    box.appendChild(pre);
    section.appendChild(box);

    button.addEventListener("click", function () {
      const done = function (label) {
        button.textContent = label;
        window.setTimeout(function () { button.textContent = "Copy"; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code.textContent).then(
          function () { done("Copied"); },
          function () { selectText(code); done("Selected"); }
        );
      } else {
        selectText(code);
        done("Selected");
      }
    });

    if (paper.funding) section.appendChild(el("p", "funding", paper.funding));
    return section;
  }

  /** Fallback when the clipboard is unavailable: select the text instead. */
  function selectText(node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /* ---------------------------------------------------------------------- */
  /* Error state                                                             */
  /* ---------------------------------------------------------------------- */

  /** Replace the page with a short message and a way back. */
  function renderError(heading, message) {
    main.textContent = "";
    const head = el("section", "project-head container");
    head.appendChild(backLink());
    head.appendChild(el("h1", "", heading));
    head.appendChild(el("p", "project-lede", message));
    main.appendChild(head);
    document.title = "Project not found · Gaurab Pokharel";
  }
})();
