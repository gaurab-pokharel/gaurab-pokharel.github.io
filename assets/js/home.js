/* ==========================================================================
   home.js — home page script, loaded after site.js on index.html only.

   Fills three parts of the page, each from one file in update/:
   • Hero, from site.json: the role line, the headline (the page's h1), the
     intro paragraphs, the portrait and the job-market box. The box is
     hidden when "jobMarket.show" is false or the block is missing.
   • Recent papers, from papers.json: the first few entries, in file order
     (the file is kept newest first). Each row links to the paper's project
     page when it has one, otherwise to the paper itself.
   • News, from news.json: newest first. The latest few are shown and the
     rest sit behind an "Older news" disclosure.

   How many papers and news items appear is set in site.json under "home".
   Text fields may use the inline Markdown that Site.inline understands:
   [text](url), **bold** and *italic*.
   ========================================================================== */

(function () {
  "use strict";

  const Site = window.Site;
  if (!Site) {
    console.error("home.js: window.Site missing. assets/js/site.js must load first.");
    return;
  }
  const el = Site.el;

  /* ---------------------------------------------------------------------- */
  /* Hero                                                                    */
  /* ---------------------------------------------------------------------- */

  function renderHero(site) {
    const name = typeof site.name === "string" ? site.name.trim() : "";

    // Role line, e.g. "PhD candidate in Computer Science, Virginia Tech".
    const roleEl = document.getElementById("hero-role");
    if (roleEl && typeof site.role === "string" && site.role.trim()) {
      roleEl.textContent = site.role.trim();
    }

    // Headline. The name is included for screen readers and search engines,
    // since the visible h1 is a sentence about the research.
    const headlineEl = document.getElementById("hero-headline");
    if (headlineEl) {
      headlineEl.textContent = "";
      const headline = typeof site.headline === "string" ? site.headline.trim() : "";
      if (headline) {
        if (name) headlineEl.appendChild(el("span", "visually-hidden", name + ". "));
        headlineEl.appendChild(document.createTextNode(headline));
      } else {
        headlineEl.textContent = name || "Gaurab Pokharel";
      }
    }

    // Intro paragraphs.
    const introEl = document.getElementById("hero-intro");
    if (introEl) {
      introEl.textContent = "";
      const paragraphs = Array.isArray(site.intro) ? site.intro : (site.intro ? [site.intro] : []);
      paragraphs.forEach(function (text) {
        if (typeof text !== "string" || !text.trim()) return;
        const p = document.createElement("p");
        p.innerHTML = Site.inline(text);
        introEl.appendChild(p);
      });
    }

    // Portrait: only touch src when it differs, so the image that is already
    // loading is not requested twice.
    const img = document.getElementById("hero-img");
    if (img) {
      const src = typeof site.photo === "string" ? site.photo.trim() : "";
      if (src && img.getAttribute("src") !== src) img.src = src;
      if (name) img.alt = name;
    }

    renderJobMarket(site);
  }

  /** The highlighted job-market box with its CV and Email actions. */
  function renderJobMarket(site) {
    const box = document.getElementById("job-market");
    if (!box) return;
    const job = site.jobMarket;
    if (!job || job.show === false || !(job.title || job.text)) {
      box.hidden = true;
      return;
    }

    box.textContent = "";
    const label = el("div", "job-market-label");
    if (job.title) label.appendChild(el("p", "job-market-title", job.title));
    if (job.text) label.appendChild(el("p", "job-market-text", job.text));
    box.appendChild(label);

    const actions = el("div", "job-market-actions");
    const cv = el("a", "btn", "CV");
    cv.href = "cv.html";
    actions.appendChild(cv);
    if (site.email) {
      const mail = el("a", "", "Email");
      mail.href = "mailto:" + site.email;
      actions.appendChild(mail);
    }
    box.appendChild(actions);
    box.hidden = false;
  }

  /* ---------------------------------------------------------------------- */
  /* Recent papers                                                           */
  /* ---------------------------------------------------------------------- */

  function renderRecentPapers(data, site) {
    const section = document.getElementById("recent-papers-section");
    const list = document.getElementById("recent-papers");
    if (!section || !list) return;

    const limit = (site.home && Number(site.home.recentPapers)) || 3;
    const items = Site.papers.all(data).slice(0, limit);
    if (items.length === 0) return; // nothing to show; the section stays hidden

    const owner = site.name || "";
    list.textContent = "";

    items.forEach(function (item) {
      const paper = item.paper;
      const row = el("li", "paper paper--compact");
      const main = el("div", "paper-main");

      // Title, linked to the project page or to the paper.
      const heading = el("h3", "paper-title");
      const primary = Site.papers.primaryLink(paper);
      const url = paper.project
        ? "project.html?id=" + encodeURIComponent(paper.project)
        : (primary ? primary.url : "");
      if (url) {
        heading.appendChild(Site.setLink(Site.keepCompounds(el("a", "", paper.title)), url));
      } else {
        heading.textContent = paper.title;
        Site.keepCompounds(heading);
      }
      main.appendChild(heading);

      // Co-authors, e.g. "with Sanmay Das and Patrick J. Fowler".
      const others = (Array.isArray(paper.authors) ? paper.authors : [])
        .filter(function (name) { return name && name !== owner; });
      if (others.length) {
        const line = el("p", "paper-authors", "with ");
        Site.papers.appendAuthors(line, { authors: others }, owner);
        main.appendChild(line);
      }
      row.appendChild(main);

      // Short venue label with the optional pill, e.g. "Spotlight NeurIPS 2026".
      const venue = el("p", "paper-venue");
      if (paper.note) venue.appendChild(el("span", "pill", paper.note));
      const label = Site.papers.shortVenue(paper);
      if (label) venue.appendChild(el("span", "", label));
      if (venue.childNodes.length) row.appendChild(venue);

      list.appendChild(row);
    });

    section.hidden = false;
  }

  /* ---------------------------------------------------------------------- */
  /* News                                                                    */
  /* ---------------------------------------------------------------------- */

  /** One news row: the date, then one or two sentences. */
  function newsRow(item) {
    const row = el("li", "news-item");
    if (item.date) {
      const time = el("time", "news-date", Site.formatDate(item.date, "short"));
      time.dateTime = String(item.date);
      row.appendChild(time);
    }
    const text = el("p", "news-text");
    text.innerHTML = Site.inline(item.text);
    row.appendChild(text);
    return row;
  }

  function renderNews(items, site) {
    const section = document.getElementById("news-section");
    const list = document.getElementById("news-list");
    if (!section || !list || !Array.isArray(items)) return;

    // Keep items that have text and sort newest first. ISO dates order
    // correctly as strings, so the page stays right even if the file falls
    // out of order; undated items sink to the end.
    const sorted = items
      .filter(function (item) {
        return item && typeof item.text === "string" && item.text.trim() !== "";
      })
      .sort(function (a, b) {
        return String(b.date || "").localeCompare(String(a.date || ""));
      });
    if (sorted.length === 0) return; // nothing to show; the section stays hidden

    const limit = (site.home && Number(site.home.news)) || 4;
    list.textContent = "";
    sorted.slice(0, limit).forEach(function (item) { list.appendChild(newsRow(item)); });

    const older = document.getElementById("news-older");
    const olderList = document.getElementById("news-older-list");
    if (older && olderList) {
      olderList.textContent = "";
      sorted.slice(limit).forEach(function (item) { olderList.appendChild(newsRow(item)); });
      older.hidden = sorted.length <= limit;
    }

    section.hidden = false;
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                    */
  /* ---------------------------------------------------------------------- */

  async function init() {
    // The three files are independent: start all the requests together and
    // let each part of the page degrade on its own if one fails.
    const papers = Site.fetchJSON(Site.paths.papers);
    const news = Site.fetchJSON(Site.paths.news);
    papers.catch(function () {});
    news.catch(function () {});

    const site = await Site.loadSite();
    renderHero(site);

    const results = await Promise.allSettled([papers, news]);
    if (results[0].status === "fulfilled") renderRecentPapers(results[0].value, site);
    if (results[1].status === "fulfilled") renderNews(results[1].value, site);
  }

  // The script tag sits at the end of <body>, so the DOM is ready.
  init();
})();
