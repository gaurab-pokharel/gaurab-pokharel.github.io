/* ==========================================================================
   site.js — shared shell, loaded by every page.

   Responsibilities (see the site contract in README.md):
   • Fetch data/site.json once per page load.
   • Inject the header into #site-header: the name as a wordmark on the left
     (linking to index.html) and the nav (Home / Papers / Projects / CV) on
     the right, with the current page marked active by file name
     (index → Home, papers → Papers, projects/project → Projects, cv → CV).
     On narrow screens the nav collapses behind a menu button.
   • Inject the footer into #site-footer: icon links for GitHub, LinkedIn and
     Google Scholar from site.json "social", a mailto from site.json "email",
     and a small line with the name and the current year.
   • Expose three helpers on window for the page scripts:
       fetchJSON(path)        → Promise resolving to parsed JSON
       formatDate(isoString)  → readable date, e.g. "June 25, 2026"
       getParam(name)         → value of a query-string parameter (or null)
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------- */
  /* Helpers shared with the page scripts                                    */
  /* ---------------------------------------------------------------------- */

  /** Fetch and parse a JSON file; rejects on network or HTTP errors. */
  async function fetchJSON(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error("Could not load " + path + " (HTTP " + response.status + ")");
    }
    return response.json();
  }

  /**
   * Format an ISO date string ("2026-06-25") as a readable date
   * ("June 25, 2026"). The parts are parsed manually so the result is never
   * shifted by a day through time-zone conversion. Non-ISO input (for
   * example "Spring 2026") is returned unchanged.
   */
  function formatDate(isoString) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(isoString).trim());
    if (!match) return String(isoString);
    const date = new Date(+match[1], +match[2] - 1, +match[3]);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  /** Read a query-string parameter, e.g. getParam("id") on project.html?id=x */
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  window.fetchJSON = fetchJSON;
  window.formatDate = formatDate;
  window.getParam = getParam;

  /* ---------------------------------------------------------------------- */
  /* Shell data                                                              */
  /* ---------------------------------------------------------------------- */

  const NAV_ITEMS = [
    { label: "Home", href: "index.html", key: "home" },
    { label: "Papers", href: "papers.html", key: "papers" },
    { label: "Projects", href: "projects.html", key: "projects" },
    { label: "CV", href: "cv.html", key: "cv" }
  ];

  /*
   * Minimal fallback so the shell still renders if data/site.json cannot be
   * fetched — most commonly when a page is opened straight from the file
   * system, where browsers block fetch(). The deployed site (and any local
   * HTTP server) always uses data/site.json.
   */
  const FALLBACK_SITE = { name: "Gaurab Pokharel", email: "", social: {} };

  /* Inline SVG icons; fill follows the link colour via currentColor. */
  const ICONS = {
    menu:
      '<svg class="icon-menu" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/></svg>',
    close:
      '<svg class="icon-close" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6 6.4 5z"/></svg>',
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
  /* Building the shell                                                      */
  /* ---------------------------------------------------------------------- */

  /** Escape a string for safe use in HTML text or attribute position. */
  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Which nav item is active, judged from the current file name:
   * index → home, papers → papers, projects and project → projects,
   * cv → cv. Anything else (e.g. 404.html) marks nothing active.
   */
  function activeKey() {
    let file = window.location.pathname.split("/").pop() || "index.html";
    file = file.toLowerCase().replace(/\.html?$/, "");
    if (file === "" || file === "index") return "home";
    if (file === "papers") return "papers";
    if (file === "projects" || file === "project") return "projects";
    if (file === "cv") return "cv";
    return "";
  }

  /** Header: skip link, wordmark, menu button, nav. */
  function buildHeader(site) {
    const current = activeKey();
    const links = NAV_ITEMS.map(function (item) {
      const active = item.key === current ? ' aria-current="page"' : "";
      return '<li><a href="' + item.href + '"' + active + ">" + item.label + "</a></li>";
    }).join("");

    return (
      '<a class="skip-link" href="#content">Skip to content</a>' +
      '<div class="container header-inner">' +
      '<a class="wordmark" href="index.html">' + esc(site.name) + "</a>" +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">' +
      '<span class="visually-hidden">Menu</span>' + ICONS.menu + ICONS.close +
      "</button>" +
      '<nav class="site-nav" id="site-nav" aria-label="Primary"><ul>' + links + "</ul></nav>" +
      "</div>"
    );
  }

  /** One footer icon link; external links open in a new tab. */
  function iconLink(href, label, icon) {
    const external = href.indexOf("http") === 0;
    return (
      '<li><a href="' + esc(href) + '" aria-label="' + esc(label) + '"' +
      (external ? ' target="_blank" rel="noopener"' : "") +
      ">" + icon + "</a></li>"
    );
  }

  /** Footer: social icon links, mailto, and the name + current year. */
  function buildFooter(site) {
    const social = site.social || {};
    const items = [];
    if (social.github) items.push(iconLink(social.github, "GitHub", ICONS.github));
    if (social.linkedin) items.push(iconLink(social.linkedin, "LinkedIn", ICONS.linkedin));
    if (social.scholar) items.push(iconLink(social.scholar, "Google Scholar", ICONS.scholar));
    if (site.email) items.push(iconLink("mailto:" + site.email, "Email", ICONS.email));

    const year = new Date().getFullYear();

    return (
      '<div class="container footer-inner">' +
      (items.length ? '<ul class="social-links">' + items.join("") + "</ul>" : "") +
      '<p class="footer-meta">© ' + year + " " + esc(site.name) + "</p>" +
      "</div>"
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Mobile menu behaviour                                                   */
  /* ---------------------------------------------------------------------- */

  function initNavToggle(header) {
    const toggle = header.querySelector(".nav-toggle");
    const nav = header.querySelector(".site-nav");
    if (!toggle || !nav) return;

    const isOpen = function () {
      return header.classList.contains("nav-open");
    };

    function setOpen(open) {
      header.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    // Choosing a page closes the menu.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    // Escape closes the menu and returns focus to the button.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Clicking or tapping outside the header closes the menu.
    document.addEventListener("click", function (event) {
      if (isOpen() && !header.contains(event.target)) setOpen(false);
    });

    // Reset the state when the viewport grows past the mobile breakpoint,
    // so aria-expanded stays in sync with what CSS shows.
    if (typeof window.matchMedia === "function") {
      const desktop = window.matchMedia("(min-width: 768px)");
      const reset = function (mq) {
        if (mq.matches) setOpen(false);
      };
      if (typeof desktop.addEventListener === "function") {
        desktop.addEventListener("change", reset);
      } else if (typeof desktop.addListener === "function") {
        desktop.addListener(reset); // older Safari
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                    */
  /* ---------------------------------------------------------------------- */

  async function init() {
    const headerEl = document.getElementById("site-header");
    const footerEl = document.getElementById("site-footer");

    let site = FALLBACK_SITE;
    try {
      site = await fetchJSON("data/site.json");
    } catch (error) {
      console.warn(
        "site.js: using built-in fallback shell data (" + error.message + "). " +
        "Tip: serve the site over HTTP, e.g. `python3 -m http.server`."
      );
    }

    if (headerEl) {
      headerEl.innerHTML = buildHeader(site);
      initNavToggle(headerEl);
    }
    if (footerEl) {
      footerEl.innerHTML = buildFooter(site);
    }

    // Let the skip link move focus into the page content.
    const content = document.getElementById("content");
    if (content && !content.hasAttribute("tabindex")) {
      content.setAttribute("tabindex", "-1");
    }
  }

  // The script tag sits at the end of <body>, so the DOM is ready.
  init();
})();
