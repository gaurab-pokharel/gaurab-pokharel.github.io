/* ==========================================================================
   home.js — home page script, loaded after site.js on index.html only.

   Responsibilities:
   • Fill the hero from data/site.json: the name (h1), the role line, the
     portrait's src and alt, and the bio paragraphs. Bio strings are stored
     as HTML in site.json (they carry inline links — see README.md), so they
     are rendered as HTML; site.json is first-party content committed to
     this repository, not user input.
   • Render "Recent news" from data/news.json: newest first, at most
     NEWS_LIMIT items. Each item is
       { "date": "YYYY-MM-DD", "title": "...", "body": "...", "link": "" }
     The title is rendered as a small heading, linked when the item has a
     link. The body supports an inline-Markdown subset — [text](url) links
     and **bold** — rendered by the tiny parser below (no external library;
     the CDN Markdown parser is reserved for the project detail page). The
     older { "date", "text", "link" } shape still renders: the plain text
     becomes the body, linked when there is a link but no title to carry it.
     The section stays hidden when the file can't be loaded or is empty.

   Uses the helpers site.js exposes on window:
     fetchJSON(path)       → Promise resolving to parsed JSON
     formatDate(isoString) → readable date, e.g. "June 25, 2026"
   ========================================================================== */

(function () {
  "use strict";

  /** How many news items the home page shows. */
  const NEWS_LIMIT = 6;

  /* ---------------------------------------------------------------------- */
  /* Hero                                                                    */
  /* ---------------------------------------------------------------------- */

  /** Fill the hero (name, role, portrait, bio) from the site.json object. */
  function renderHero(site) {
    if (!site || typeof site !== "object") return;

    const name = typeof site.name === "string" ? site.name.trim() : "";

    // Name — the h1 ships with a static fallback; replace it when data loads.
    if (name) {
      const nameEl = document.getElementById("hero-name");
      if (nameEl) nameEl.textContent = name;
    }

    // Role — muted line under the name. Loaded data is authoritative: show
    // site.json's role, or hide the line when site.json leaves it empty.
    const roleEl = document.getElementById("hero-role");
    if (roleEl) {
      const role = typeof site.role === "string" ? site.role.trim() : "";
      if (role) {
        roleEl.textContent = role;
        roleEl.hidden = false;
      } else {
        roleEl.hidden = true;
      }
    }

    // Portrait — only touch src when it differs, so the eagerly loading
    // fallback image isn't re-requested for nothing.
    const img = document.getElementById("hero-img");
    if (img) {
      const src = typeof site.profileImage === "string" ? site.profileImage.trim() : "";
      if (src && img.getAttribute("src") !== src) img.src = src;
      if (name) img.alt = name;
    }

    // Bio — one <p> per entry. Entries are first-party HTML strings from
    // this repository's own data/site.json (inline links), rendered as such.
    const bioEl = document.getElementById("hero-bio");
    if (bioEl && Array.isArray(site.bio)) {
      bioEl.textContent = "";
      site.bio.forEach(function (paragraph) {
        if (typeof paragraph !== "string" || paragraph.trim() === "") return;
        const p = document.createElement("p");
        p.innerHTML = paragraph;
        bioEl.appendChild(p);
      });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Recent news                                                             */
  /* ---------------------------------------------------------------------- */

  /** Escape HTML special characters so news bodies can't inject markup. */
  function escapeHTML(source) {
    return String(source)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Render the inline-Markdown subset used by news bodies:
   *   [text](url)  →  a link
   *   **text**     →  <strong> (weight 500 sitewide)
   * The two nest either way round: **[x](url)** and [**x**](url) both work,
   * and URLs may be relative (project.html?id=...) or absolute. The input
   * is HTML-escaped first, so the only markup in the output is what this
   * function itself emits. URLs may not contain spaces or parentheses.
   */
  function renderInlineMarkdown(source) {
    return escapeHTML(source)
      .replace(/\[([^\]]+)\]\(([^()\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  /** Render up to NEWS_LIMIT news items, newest first, and show the section. */
  function renderNews(items) {
    const section = document.getElementById("news-section");
    const list = document.getElementById("news-list");
    if (!section || !list || !Array.isArray(items)) return;

    // Keep items that have something to show, then sort newest first. ISO
    // dates (YYYY-MM-DD) order correctly as strings, so this stays robust
    // even if the file ever falls out of its newest-first convention;
    // undated items sink to the end. filter() copies, so the input array
    // isn't mutated.
    const latest = items
      .filter(function (item) {
        if (!item) return false;
        return ["title", "body", "text"].some(function (key) {
          return typeof item[key] === "string" && item[key].trim() !== "";
        });
      })
      .sort(function (a, b) {
        return String(b.date || "").localeCompare(String(a.date || ""));
      })
      .slice(0, NEWS_LIMIT);

    if (latest.length === 0) return; // nothing to show; section stays hidden

    const fragment = document.createDocumentFragment();

    latest.forEach(function (item) {
      const li = document.createElement("li");

      // Date, formatted for reading ("June 25, 2026") with the ISO value
      // kept on the datetime attribute.
      if (item.date) {
        const time = document.createElement("time");
        time.className = "news-date";
        time.dateTime = String(item.date);
        time.textContent = window.formatDate(item.date);
        li.appendChild(time);
      }

      const wrap = document.createElement("div");
      wrap.className = "news-item";

      const link = typeof item.link === "string" ? item.link.trim() : "";
      const title = typeof item.title === "string" ? item.title.trim() : "";
      const body = typeof item.body === "string" ? item.body.trim() : "";
      const legacy = typeof item.text === "string" ? item.text.trim() : "";

      // Title line, linked when the item has a link.
      if (title) {
        const heading = document.createElement("h3");
        heading.className = "news-title";
        if (link) {
          const anchor = document.createElement("a");
          anchor.href = link;
          anchor.textContent = title;
          heading.appendChild(anchor);
        } else {
          heading.textContent = title;
        }
        wrap.appendChild(heading);
      }

      // Body: the inline-Markdown subset. Falls back to the older plain
      // "text" field, which keeps its old linked behaviour when the item
      // has a link but no title to carry it.
      if (body) {
        const p = document.createElement("p");
        p.className = "news-body";
        p.innerHTML = renderInlineMarkdown(body);
        wrap.appendChild(p);
      } else if (legacy) {
        const p = document.createElement("p");
        p.className = "news-body";
        if (link && !title) {
          const anchor = document.createElement("a");
          anchor.href = link;
          anchor.textContent = legacy;
          p.appendChild(anchor);
        } else {
          p.textContent = legacy;
        }
        wrap.appendChild(p);
      }

      li.appendChild(wrap);
      fragment.appendChild(li);
    });

    list.textContent = ""; // idempotent if ever re-run
    list.appendChild(fragment);
    section.hidden = false;
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                    */
  /* ---------------------------------------------------------------------- */

  async function init() {
    if (typeof window.fetchJSON !== "function" || typeof window.formatDate !== "function") {
      console.error("home.js: window helpers missing — assets/js/site.js must load first.");
      return;
    }

    // The two files are independent: fetch both in parallel and let each
    // half of the page degrade on its own if one of them fails.
    const results = await Promise.allSettled([
      window.fetchJSON("data/site.json"),
      window.fetchJSON("data/news.json")
    ]);

    if (results[0].status === "fulfilled") {
      renderHero(results[0].value);
    } else {
      console.warn("home.js: hero kept its built-in fallback —", results[0].reason);
    }

    if (results[1].status === "fulfilled") {
      renderNews(results[1].value);
    } else {
      console.warn("home.js: news section left hidden —", results[1].reason);
    }
  }

  // The script tag sits at the end of <body>, so the DOM is ready.
  init();
})();