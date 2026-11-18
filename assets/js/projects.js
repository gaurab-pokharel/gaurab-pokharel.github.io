/* ==========================================================================
   projects.js — Projects page, loaded after site.js on projects.html only.

   Reads update/projects.json and renders one card per project: current
   projects first, then past, keeping the file's order within each group.

   A card shows the thumbnail, the year and status, the title, the one-line
   summary and the first two topics. The thumbnail is read from the project's
   own folder, update/projects/<id>/thumbnail.png, unless the entry names
   another file with "thumbnail" (for example "thumbnail.svg"). The title
   link is stretched over the whole card by main.css, so the card is one tap
   target while screen readers hear just the project title.

   The All / Current / Past filter re-appends the matching cards to the
   grid, so it needs no CSS to hide anything.
   ========================================================================== */

(function () {
  "use strict";

  const Site = window.Site;
  const grid = document.getElementById("project-grid");
  const filterBar = document.getElementById("project-filters");
  const announcer = document.getElementById("filter-status");
  const note = document.getElementById("grid-note");

  // Loaded on the wrong page, or site.js is missing: do nothing.
  if (!grid) return;
  if (!Site) {
    console.error("projects.js: window.Site missing. assets/js/site.js must load first.");
    return;
  }
  const el = Site.el;

  /** How many topics a card shows; the project page lists all of them. */
  const TAGS_ON_CARD = 2;

  // Every rendered card in display order: { element, status }.
  const cards = [];

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "current", label: "Current" },
    { value: "past", label: "Past" }
  ];

  init();

  async function init() {
    let projects;
    try {
      projects = await Site.fetchJSON(Site.paths.projects);
    } catch (error) {
      showNote("Projects could not be loaded right now.");
      return;
    }

    // Entries without an id have nowhere to link; skip them loudly.
    const usable = (Array.isArray(projects) ? projects : []).filter(function (project) {
      if (project && project.id) return true;
      console.warn("projects.js: skipping a project entry with no id:", project);
      return false;
    });

    if (usable.length === 0) {
      showNote("No projects to show yet.");
      return;
    }

    renderCards(orderProjects(usable));
    buildFilterBar();
  }

  /* ------------------------------------------------------------------------ */
  /* Ordering                                                                  */
  /* ------------------------------------------------------------------------ */

  // "current" or anything else ("past", missing, unexpected), normalized
  // once so ordering and filtering always agree.
  function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase() === "current" ? "current" : "past";
  }

  // Current projects first, then past, preserving file order within each.
  function orderProjects(projects) {
    const current = projects.filter(function (p) { return normalizeStatus(p.status) === "current"; });
    const past = projects.filter(function (p) { return normalizeStatus(p.status) !== "current"; });
    return current.concat(past);
  }

  /* ------------------------------------------------------------------------ */
  /* Rendering                                                                 */
  /* ------------------------------------------------------------------------ */

  function renderCards(projects) {
    const fragment = document.createDocumentFragment();
    projects.forEach(function (project) {
      const card = buildCard(project);
      cards.push(card);
      fragment.appendChild(card.element);
    });
    grid.textContent = "";
    grid.appendChild(fragment);
  }

  // One card: thumbnail, year and status, linked title, summary, topics.
  function buildCard(project) {
    const status = normalizeStatus(project.status);
    const card = el("li", "project-card");

    card.appendChild(buildThumb(project));

    const head = el("div", "project-card-head");
    const meta = [project.period, status === "current" ? "Current" : "Past"].filter(Boolean);
    head.appendChild(el("p", "project-card-meta", meta.join(" · ")));

    const heading = el("h2", "project-card-title");
    const link = Site.keepCompounds(el("a", "", project.title || project.id));
    link.href = "project.html?id=" + encodeURIComponent(project.id);
    heading.appendChild(link);
    head.appendChild(heading);
    card.appendChild(head);

    if (project.summary) {
      card.appendChild(el("p", "project-card-summary", project.summary));
    }

    const tags = (Array.isArray(project.tags) ? project.tags : []).filter(Boolean).slice(0, TAGS_ON_CARD);
    if (tags.length) {
      card.appendChild(el("p", "project-card-tags", tags.join(" · ")));
    }

    return { element: card, status: status };
  }

  // Fixed 16:10 frame. If the image is missing or fails to load it is
  // removed, leaving the plain frame, so the grid never shows a broken icon.
  function buildThumb(project) {
    const frame = el("div", "project-thumb");
    const image = document.createElement("img");
    image.src = Site.paths.projectDir(project.id) + (project.thumbnail || "thumbnail.png");
    image.alt = ""; // decorative: the title beside it names the project
    image.width = 1200;
    image.height = 750;
    image.setAttribute("loading", "lazy");
    image.setAttribute("decoding", "async");
    image.addEventListener("error", function () { image.remove(); });
    frame.appendChild(image);
    return frame;
  }

  /* ------------------------------------------------------------------------ */
  /* Status filter                                                             */
  /* ------------------------------------------------------------------------ */

  function buildFilterBar() {
    if (!filterBar) return;

    // Only worth showing when both groups exist; otherwise every option but
    // "All" would be a dead end, so the bar stays empty (and hidden).
    const currentCount = cards.filter(function (c) { return c.status === "current"; }).length;
    if (currentCount === 0 || currentCount === cards.length) return;

    FILTERS.forEach(function (filter) {
      const button = el("button", "filter-btn", filter.label);
      button.type = "button";
      button.dataset.status = filter.value;
      button.setAttribute("aria-pressed", String(filter.value === "all"));
      button.addEventListener("click", function () { applyFilter(filter.value); });
      filterBar.appendChild(button);
    });
  }

  function applyFilter(value) {
    // Reflect the choice on the buttons; CSS styles [aria-pressed="true"].
    filterBar.querySelectorAll(".filter-btn").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.status === value));
    });

    const visible = cards.filter(function (card) {
      return value === "all" || card.status === value;
    });

    // Re-append the matching cards in their original order; the rest are
    // simply detached.
    grid.textContent = "";
    const fragment = document.createDocumentFragment();
    visible.forEach(function (card) { fragment.appendChild(card.element); });
    grid.appendChild(fragment);

    // Quiet announcement for screen reader users.
    if (announcer) {
      const noun = visible.length === 1 ? "project" : "projects";
      announcer.textContent = value === "all"
        ? "Showing all " + visible.length + " " + noun + "."
        : "Showing " + visible.length + " " + value + " " + noun + " of " + cards.length + ".";
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Fallback note                                                             */
  /* ------------------------------------------------------------------------ */

  function showNote(message) {
    if (!note) return;
    note.textContent = message;
    note.hidden = false;
  }
})();
