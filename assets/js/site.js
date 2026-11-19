/* ==========================================================================
   site.js — shared shell and helpers, loaded by every page.

   What it does
   • Injects the header into #site-header (the name as a wordmark linking to
     index.html, and the tabs listed in NAV_ITEMS below, with the current
     page's tab marked) and the footer into #site-footer (GitHub, LinkedIn,
     Google Scholar and email icons, then "© year name").
   • Reads everything from the update/ folder. Pages never hardcode content.
     The content files are JSON that may also hold notes (see stripNotes).
   • Exposes helpers on window.Site for the page scripts, and keeps the three
     original helpers on window as well:
       fetchJSON(path)        → Promise of parsed JSON (cached per path)
       formatDate(iso, style) → "June 25, 2026", or "Jun 25, 2026" with
                                style "short"; non-ISO text passes through
       getParam(name)         → value of a query-string parameter (or null)

   Papers are entered once, in update/papers.json. The helpers under
   Site.papers turn one entry into everything the pages show: the venue
   line, the short venue label, the links, the author list and the BibTeX.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------- */
  /* Where the content lives                                                 */
  /* ---------------------------------------------------------------------- */

  /* One line per content file. A page script reads a file with
     Site.fetchJSON(Site.paths.news), for example. A new content file gets a
     line here (README.md, "Adding a tab"). */
  const PATHS = {
    site: "update/site.json",
    news: "update/news.json",
    papers: "update/papers.json",
    projects: "update/projects.json",
    cv: "update/cv.json",
    /** Folder holding one project's write-up, thumbnail and figures. */
    projectDir: function (id) {
      return "update/projects/" + encodeURIComponent(id) + "/";
    }
  };

  /* ---------------------------------------------------------------------- */
  /* The tabs                                                                */
  /* ---------------------------------------------------------------------- */

  /* One line per tab, in the order they appear in the header. A new tab gets
     a line here (README.md, "Adding a tab", lists the other steps).
       label  the word shown in the header
       href   the page the tab opens
       also   other pages that belong to the tab and keep it marked */
  const NAV_ITEMS = [
    { label: "Home", href: "index.html" },
    { label: "Papers", href: "papers.html" },
    { label: "Projects", href: "projects.html", also: ["project.html"] },
    { label: "CV", href: "cv.html" }
  ];

  /* Minimal fallback so the shell still renders if update/site.json cannot
     be read (most often a page opened straight from disk, where browsers
     block fetch). */
  const FALLBACK_SITE = { name: "Gaurab Pokharel", email: "", social: {} };

  /* Inline SVG icons; fill follows the link colour via currentColor. */
  const ICONS = {
    github:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>',
    scholar:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M5.242 13.769 0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.749-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>',
    email:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>'
  };

  /* ---------------------------------------------------------------------- */
  /* Loading data                                                            */
  /* ---------------------------------------------------------------------- */

  /** True on a local preview (python3 -m http.server) or a file:// page. */
  function isLocalPreview() {
    const host = window.location.hostname;
    return host === "" || host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  }

  /**
   * Log a problem with a file in update/. On a local preview the message is
   * also shown in a banner at the top of the page, so a typo in the JSON is
   * obvious before the site is deployed. Visitors to the live site never
   * see the banner.
   */
  function reportDataError(message) {
    console.error("update/ data problem: " + message);
    if (!isLocalPreview() || !document.body) return;

    let box = document.getElementById("data-errors");
    if (!box) {
      box = document.createElement("div");
      box.id = "data-errors";
      box.className = "data-errors";
      box.setAttribute("role", "alert");
      const lead = document.createElement("p");
      lead.textContent =
        "Local preview only: something in the update folder could not be read. " +
        "If you opened this page straight from disk, serve the folder instead: python3 -m http.server";
      box.appendChild(lead);
      document.body.insertBefore(box, document.body.firstChild);
    }
    const line = document.createElement("p");
    line.textContent = message;
    box.appendChild(line);
  }

  /**
   * The content files are JSON with two allowances that make them easier to
   * edit by hand:
   *   • notes, written as // to the end of the line, or between slash-star
   *     and star-slash over as many lines as needed;
   *   • a comma after the last item of a list, which strict JSON forbids
   *     and which is the most common slip when pasting a new item.
   * This removes both and returns plain JSON text. Whatever is inside a
   * "quoted string" is left alone, so an address such as https://arxiv.org
   * is safe. Notes are replaced by spaces, not deleted, so a line number in
   * an error message still points at the right line of the file.
   */
  function stripNotes(text) {
    const out = [];
    const length = text.length;
    let comma = -1; // where in `out` a comma sits that may turn out to end a list
    let last = "";  // the last character that was not a space or part of a note
    let i = 0;

    while (i < length) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"') {
        // A string: copy it whole, stepping over escaped characters.
        let end = i + 1;
        while (end < length && text[end] !== '"') end += text[end] === "\\" ? 2 : 1;
        out.push(text.slice(i, end + 1));
        i = end + 1;
        comma = -1;
        last = '"';
      } else if (ch === "/" && next === "/") {
        // A note that runs to the end of the line.
        while (i < length && text[i] !== "\n") {
          out.push(" ");
          i += 1;
        }
      } else if (ch === "/" && next === "*") {
        // A note that runs to its closing mark, over one line or several.
        const close = text.indexOf("*/", i + 2);
        const end = close === -1 ? length : close + 2;
        for (; i < end; i += 1) out.push(text[i] === "\n" ? "\n" : " ");
      } else {
        if (ch === ",") {
          // Only a comma that comes after an item can be the spare one.
          comma = last && "[{,:".indexOf(last) === -1 ? out.length : -1;
        } else if ((ch === "]" || ch === "}") && comma !== -1) {
          out[comma] = " "; // nothing followed that comma: drop it
          comma = -1;
        } else if (ch.trim() !== "") {
          comma = -1;
        }
        if (ch.trim() !== "") last = ch;
        out.push(ch);
        i += 1;
      }
    }
    return out.join("");
  }

  /** Turn the text of a content file into data. Throws if it is malformed. */
  function parseContent(text) {
    return JSON.parse(stripNotes(text));
  }

  const jsonCache = new Map();

  /**
   * Fetch and parse a content file. Each path is requested once per page
   * load; later calls reuse the same promise. Rejects on network errors,
   * HTTP errors and a file that cannot be parsed.
   */
  function fetchJSON(path) {
    if (!jsonCache.has(path)) {
      const request = fetch(path)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Could not load " + path + " (HTTP " + response.status + ")");
          }
          return response.text();
        })
        .then(function (text) {
          try {
            return parseContent(text);
          } catch (error) {
            throw new Error(path + " has a mistake in it: " + error.message);
          }
        })
        .catch(function (error) {
          const message = /update\//.test(error.message)
            ? error.message
            : "Could not load " + path + " (" + error.message + ")";
          reportDataError(message);
          throw new Error(message);
        });
      jsonCache.set(path, request);
    }
    return jsonCache.get(path);
  }

  /**
   * Once this page has loaded and the browser has nothing else to do, fetch
   * the content files the page did not need itself. They are a few kilobytes
   * each. With them in the browser's cache, the next page finds its data
   * ready and can slide in complete, instead of filling in after it arrives.
   * Skipped for visitors who have asked their browser to save data.
   */
  function warmCache() {
    if (navigator.connection && navigator.connection.saveData) return;
    Object.keys(PATHS).forEach(function (name) {
      const path = PATHS[name];
      if (typeof path !== "string" || jsonCache.has(path)) return;
      // Read the file to the end, so the browser stores a complete copy.
      fetch(path)
        .then(function (response) { return response.arrayBuffer(); })
        .catch(function () { /* not needed yet; the next page will ask again */ });
    });
  }

  /** update/site.json, falling back to a minimal shell if it cannot load. */
  function loadSite() {
    return fetchJSON(PATHS.site).catch(function () {
      return FALLBACK_SITE;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Small helpers                                                           */
  /* ---------------------------------------------------------------------- */

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

  /**
   * Format an ISO date ("2026-06-25") as "June 25, 2026", or "Jun 25, 2026"
   * when style is "short". The parts are read directly from the string, so
   * the result never shifts by a day through time-zone conversion. Anything
   * that is not an ISO date ("Spring 2026", "October 2026") is returned
   * unchanged.
   */
  function formatDate(isoString, style) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(isoString).trim());
    if (!match) return String(isoString);
    const month = MONTHS[+match[2] - 1];
    if (!month) return String(isoString);
    const name = style === "short" ? month.slice(0, 3) : month;
    return name + " " + (+match[3]) + ", " + match[1];
  }

  /** Read a query-string parameter, e.g. getParam("id") on project.html?id=x */
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /** Escape a string for safe use in HTML text or attribute position. */
  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Create an element with an optional class and plain-text content. */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  /**
   * Keep short hyphenated compounds such as "Street-Level" on one line.
   * A browser may break a line after any hyphen, which splits a title as
   * "Two-" / "Sided". Each compound is wrapped in a no-break span. The text
   * itself is unchanged, so a copied title still has ordinary hyphens.
   * Compounds longer than 16 characters are left alone so that they can
   * still wrap on a narrow screen. Use on elements that hold plain text.
   */
  function keepCompounds(node) {
    const text = node.textContent;
    if (text.indexOf("-") === -1 || node.children.length) return node;
    node.textContent = "";
    text.split(/(\s+)/).forEach(function (piece) {
      if (/\S-\S/.test(piece) && piece.length <= 16) {
        node.appendChild(el("span", "nobreak", piece));
      } else {
        node.appendChild(document.createTextNode(piece));
      }
    });
    return node;
  }

  /** True for links that leave the site. */
  function isExternal(url) {
    return /^https?:\/\//i.test(String(url));
  }

  /** Point an anchor at a URL; links that leave the site open in a new tab. */
  function setLink(anchor, url) {
    anchor.setAttribute("href", url);
    if (isExternal(url)) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener");
    }
    return anchor;
  }

  /**
   * Render the small inline-Markdown subset used in update/ text fields:
   *   [text](url)   a link (relative, https or mailto)
   *   **text**      bold
   *   *text*        italic
   * The input is HTML-escaped first, so the only markup in the result is
   * what this function adds. Returns an HTML string.
   */
  function inline(source) {
    return escapeHTML(source)
      .replace(/\[([^\]]+)\]\(([^()\s]+)\)/g, function (whole, text, url) {
        if (/^\s*javascript:/i.test(url)) return text;
        const extra = isExternal(url) ? ' target="_blank" rel="noopener"' : "";
        return '<a href="' + url + '"' + extra + ">" + text + "</a>";
      })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  }

  /* ---------------------------------------------------------------------- */
  /* Papers: one entry in update/papers.json feeds every page                */
  /* ---------------------------------------------------------------------- */

  /** Every paper as { paper, section }, in file order. Sections marked
      "listed": false are skipped unless includeUnlisted is true. */
  function allPapers(data, includeUnlisted) {
    const out = [];
    const sections = data && Array.isArray(data.sections) ? data.sections : [];
    sections.forEach(function (section) {
      if (!section || !Array.isArray(section.entries)) return;
      if (section.listed === false && !includeUnlisted) return;
      section.entries.forEach(function (paper) {
        if (paper && paper.title) out.push({ paper: paper, section: section });
      });
    });
    return out;
  }

  /** Papers that belong to a project (including unlisted sections). */
  function papersForProject(data, projectId) {
    return allPapers(data, true)
      .filter(function (item) { return item.paper.project === projectId; })
      .map(function (item) { return item.paper; });
  }

  /**
   * The full venue line, built from the entry's fields:
   *   venue (abbr), extra, place, volume(number):pages, status
   * A paper with no venue shows its arXiv number instead.
   */
  function venueLine(paper) {
    const parts = [];
    if (paper.venue) {
      parts.push(paper.venue + (paper.abbr ? " (" + paper.abbr + ")" : ""));
    } else if (paper.arxiv) {
      parts.push("arXiv:" + paper.arxiv);
    }
    if (paper.extra) parts.push(paper.extra);
    if (paper.place) parts.push(paper.place);

    // Word joiners (U+2060) keep a page range such as 280–320 on one line.
    const pages = paper.pages
      ? String(paper.pages).replace(/\s*([\u2013\u2014-])\s*/g, "\u2060$1\u2060")
      : "";
    const volume = paper.volume
      ? String(paper.volume) + (paper.number ? "(" + paper.number + ")" : "")
      : "";
    if (volume && pages) parts.push(volume + ":" + pages);
    else if (volume) parts.push(volume);
    else if (pages) parts.push("pp.\u00a0" + pages);

    if (paper.status) parts.push(paper.status);
    return parts.join(", ");
  }

  /** Short venue label for tight spots, e.g. "NeurIPS 2026" or "arXiv 2023". */
  function shortVenue(paper) {
    if (paper.abbr) return paper.abbr;
    if (paper.venue) return paper.venue;
    if (paper.arxiv) return "arXiv" + (paper.year ? " " + paper.year : "");
    return paper.year ? String(paper.year) : "";
  }

  /** Links for a paper: arXiv and DOI from their ids, then any extras. */
  function paperLinks(paper) {
    const links = [];
    if (paper.arxiv) {
      links.push({ label: "arXiv", url: "https://arxiv.org/abs/" + paper.arxiv, kind: "arxiv" });
    }
    if (paper.doi) {
      links.push({ label: "DOI", url: "https://doi.org/" + paper.doi, kind: "doi" });
    }
    (Array.isArray(paper.links) ? paper.links : []).forEach(function (link) {
      if (link && link.url) {
        links.push({ label: link.label || "Link", url: String(link.url), kind: "extra" });
      }
    });
    return links;
  }

  /** The link to send a reader to: arXiv when there is one (always free to
      read), otherwise the DOI, otherwise the first extra link. */
  function primaryLink(paper) {
    return paperLinks(paper)[0] || null;
  }

  /** "A", "A and B", "A, B, and C" as a list of text pieces, so callers can
      wrap individual names. Returns [{ text, name? }]. */
  function authorPieces(names) {
    const clean = (Array.isArray(names) ? names : [names])
      .map(function (name) { return String(name || "").trim(); })
      .filter(Boolean);
    const pieces = [];
    clean.forEach(function (name, index) {
      if (index > 0) {
        const last = index === clean.length - 1;
        if (clean.length === 2) pieces.push({ text: " and " });
        else pieces.push({ text: last ? ", and " : ", " });
      }
      pieces.push({ text: name, name: name });
    });
    return pieces;
  }

  /**
   * Append a paper's author list to a parent element. The site owner's name
   * is wrapped in <strong>; authors named in the entry's "equal" list get an
   * asterisk, with "*Equal contribution" added at the end of the line.
   * options.marks maps a name to a superscript (used for affiliations).
   */
  function appendAuthors(parent, paper, ownerName, options) {
    const marks = (options && options.marks) || {};
    const equal = Array.isArray(paper.equal) ? paper.equal : [];
    authorPieces(paper.authors).forEach(function (piece) {
      if (!piece.name) {
        parent.appendChild(document.createTextNode(piece.text));
        return;
      }
      const label = piece.name + (equal.indexOf(piece.name) !== -1 ? "*" : "");
      parent.appendChild(piece.name === ownerName ? el("strong", "", label) : document.createTextNode(label));
      if (marks[piece.name]) parent.appendChild(el("sup", "", marks[piece.name]));
    });
    if (equal.length && !(options && options.skipEqualNote)) {
      parent.appendChild(document.createTextNode(" (*equal contribution)"));
    }
    return parent;
  }

  /** Lower-case ASCII letters only: "Malmö" → "malmo". */
  function asciiWord(value) {
    return String(value)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
  }

  /** Citation key such as "pokharel2026budgeting". "bibkey" overrides it. */
  function bibKey(paper) {
    if (paper.bibkey) return String(paper.bibkey);
    const first = String((Array.isArray(paper.authors) ? paper.authors[0] : paper.authors) || "");
    const last = asciiWord(first.trim().split(/\s+/).pop() || "") || "paper";
    const skip = ["a", "an", "the", "on", "of", "in", "for", "to", "and"];
    const word = String(paper.title || "")
      .split(/\s+/)
      .map(asciiWord)
      .filter(function (w) { return w && skip.indexOf(w) === -1; })[0] || "";
    return last + (paper.year || "") + word;
  }

  /**
   * BibTeX for one paper, generated from its fields. The entry type is
   * "bibtype" when the entry sets one; otherwise a paper with a venue is an
   * @inproceedings and one without is a @misc with its arXiv number.
   */
  function bibtex(paper) {
    const type = paper.bibtype || (paper.venue ? "inproceedings" : "misc");
    const clean = function (value) {
      return String(value).replace(/([&%#])/g, "\\$1");
    };
    const fields = [];
    const add = function (name, value) {
      if (value !== undefined && value !== null && String(value) !== "") {
        fields.push([name, String(value)]);
      }
    };

    add("title", clean(paper.title));
    add("author", (Array.isArray(paper.authors) ? paper.authors : [paper.authors])
      .filter(Boolean).map(clean).join(" and "));

    if (paper.venue) {
      const venue = clean(paper.venue + (paper.abbr && type !== "misc" ? " (" + paper.abbr + ")" : ""));
      if (type === "article") add("journal", venue);
      else if (type === "misc") add("howpublished", venue);
      else add("booktitle", venue);
    }
    add("year", paper.year);
    add("volume", paper.volume);
    add("number", paper.number);
    if (paper.pages) add("pages", String(paper.pages).replace(/[–—]/g, "--"));
    add("doi", paper.doi);
    if (paper.arxiv) {
      add("eprint", paper.arxiv);
      add("archivePrefix", "arXiv");
    }
    const link = primaryLink(paper);
    if (link) add("url", link.url);
    if (paper.status) add("note", clean(paper.status.charAt(0).toUpperCase() + paper.status.slice(1)));

    const width = fields.reduce(function (max, field) { return Math.max(max, field[0].length); }, 0);
    const lines = fields.map(function (field) {
      return "  " + field[0] + " ".repeat(width - field[0].length) + " = {" + field[1] + "}";
    });
    return "@" + type + "{" + bibKey(paper) + ",\n" + lines.join(",\n") + "\n}";
  }

  /* ---------------------------------------------------------------------- */
  /* Building the shell                                                      */
  /* ---------------------------------------------------------------------- */

  /** "papers" for papers.html, /papers and PAPERS.HTML; "index" for "". */
  function pageName(file) {
    return String(file || "").toLowerCase().replace(/\.html?$/, "") || "index";
  }

  /**
   * The tab the current page belongs to, judged from the file name in the
   * address: the tab whose own page this is, or that lists this page under
   * "also". Any other page (404.html, for example) marks no tab.
   */
  function activeTab() {
    const here = pageName(window.location.pathname.split("/").pop());
    return NAV_ITEMS.find(function (item) {
      return [item.href].concat(item.also || []).some(function (file) {
        return pageName(file) === here;
      });
    }) || null;
  }

  /** Header: skip link, wordmark, nav. Every nav link carries an empty
      .nav-mark span, which main.css draws as the underline: full width under
      the current page's link, and growing in when another link is hovered. */
  function buildHeader(site) {
    const current = activeTab();
    const links = NAV_ITEMS.map(function (item) {
      const active = item === current ? ' aria-current="page"' : "";
      return (
        '<li><a href="' + item.href + '"' + active + ">" + item.label +
        '<span class="nav-mark" aria-hidden="true"></span></a></li>'
      );
    }).join("");

    return (
      '<a class="skip-link" href="#content">Skip to content</a>' +
      '<div class="container header-inner">' +
      '<a class="wordmark" href="index.html">' + escapeHTML(site.name || FALLBACK_SITE.name) + "</a>" +
      '<nav class="site-nav" aria-label="Primary"><ul>' + links + "</ul></nav>" +
      "</div>"
    );
  }

  /** One footer icon link; external links open in a new tab. */
  function iconLink(href, label, icon) {
    return (
      '<li><a href="' + escapeHTML(href) + '" aria-label="' + escapeHTML(label) + '"' +
      (isExternal(href) ? ' target="_blank" rel="noopener"' : "") +
      ">" + icon + "</a></li>"
    );
  }

  /** Footer: GitHub, LinkedIn, Google Scholar, Email, then "© year name". */
  function buildFooter(site) {
    const social = site.social || {};
    const items = [];
    if (social.github) items.push(iconLink(social.github, "GitHub", ICONS.github));
    if (social.linkedin) items.push(iconLink(social.linkedin, "LinkedIn", ICONS.linkedin));
    if (social.scholar) items.push(iconLink(social.scholar, "Google Scholar", ICONS.scholar));
    if (site.email) items.push(iconLink("mailto:" + site.email, "Email", ICONS.email));

    return (
      '<div class="container footer-inner">' +
      (items.length ? '<ul class="social-links">' + items.join("") + "</ul>" : "") +
      '<p class="footer-meta">© ' + new Date().getFullYear() + " " +
      escapeHTML(site.name || FALLBACK_SITE.name) + "</p>" +
      "</div>"
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Public surface                                                          */
  /* ---------------------------------------------------------------------- */

  window.fetchJSON = fetchJSON;
  window.formatDate = formatDate;
  window.getParam = getParam;

  window.Site = {
    paths: PATHS,
    fetchJSON: fetchJSON,
    parseContent: parseContent,
    loadSite: loadSite,
    formatDate: formatDate,
    getParam: getParam,
    escapeHTML: escapeHTML,
    el: el,
    keepCompounds: keepCompounds,
    setLink: setLink,
    isExternal: isExternal,
    inline: inline,
    reportDataError: reportDataError,
    papers: {
      all: allPapers,
      forProject: papersForProject,
      venueLine: venueLine,
      shortVenue: shortVenue,
      links: paperLinks,
      primaryLink: primaryLink,
      appendAuthors: appendAuthors,
      bibtex: bibtex
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                    */
  /* ---------------------------------------------------------------------- */

  function init() {
    const headerEl = document.getElementById("site-header");
    const footerEl = document.getElementById("site-footer");

    // The header needs nothing but the name, so it is drawn straight away
    // (no pop-in while update/site.json loads) and corrected afterwards if
    // the file gives a different name.
    if (headerEl) headerEl.innerHTML = buildHeader(FALLBACK_SITE);

    // Let the skip link move focus into the page content.
    const content = document.getElementById("content");
    if (content && !content.hasAttribute("tabindex")) {
      content.setAttribute("tabindex", "-1");
    }

    loadSite().then(function (site) {
      const wordmark = headerEl && headerEl.querySelector(".wordmark");
      if (wordmark && site.name) wordmark.textContent = site.name;
      if (footerEl) footerEl.innerHTML = buildFooter(site);
    });

    // After everything this page needs has loaded, get ready for the next one.
    window.addEventListener("load", function () {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(warmCache, { timeout: 3000 });
      } else {
        window.setTimeout(warmCache, 800);
      }
    });
  }

  // The script tag sits at the end of <body>, so the DOM is ready.
  init();
})();
