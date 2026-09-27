/* ==========================================================================
   projects.js — projects listing page, loaded after site.js on
   projects.html only.

   Responsibilities:
   • Fetch data/projects.json and render one card per project into the
     ready-made .card-grid / .card styles from main.css section 10 —
     current projects first, then past, keeping the JSON order within
     each group so the data file controls fine-grained ordering.
   • Each card: lazy-loaded fixed-aspect thumbnail, linked title, one-line
     summary, and tags. The title link is stretched over the whole card by
     main.css section 14, so the entire card is one tap target while
     screen readers hear just the project title as the link text.
   • Build the All / Current / Past filter above the grid. Filtering works
     by re-appending the matching cards to the grid, so it needs no extra
     CSS to hide anything — the base grid keeps working on its own.

   Depends on window.fetchJSON from assets/js/site.js.
   ========================================================================== */

(function () {
  "use strict";

  const grid = document.getElementById("project-grid");
  const filterBar = document.getElementById("project-filters");
  const announcer = document.getElementById("filter-status");
  const note = document.getElementById("grid-note");

  // Loaded on the wrong page (or the hook was removed): do nothing.
  if (!grid) return;

  // Every rendered card in display order: { element, status }.
  // Kept here so the filter can re-append matching cards without
  // re-reading the DOM or needing any CSS for the hidden state.
  const cards = [];

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "current", label: "Current" },
    { value: "past", label: "Past" }
  ];

  init();

  async function init() {
    if (typeof window.fetchJSON !== "function") {
      console.error("projects.js: window.fetchJSON missing — assets/js/site.js must load first.");
      showNote("Projects could not be loaded.");
      return;
    }

    let projects;
    try {
      projects = await window.fetchJSON("data/projects.json");
    } catch (error) {
      // Typical causes: a network hiccup, or the page opened via file://
      // where browsers block fetch. Keep the visible note generic and put
      // the detail in the console, matching site.js's own fallback.
      console.error("projects.js: could not load data/projects.json —", error);
      showNote("Projects could not be loaded right now.");
      return;
    }

    if (!Array.isArray(projects) || projects.length === 0) {
      showNote("No projects to show yet.");
      return;
    }

    // Entries without an id have nowhere to link; skip them loudly.
    const usable = projects.filter(function (project) {
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

  // "current" or anything else ("past", missing, unexpected) — normalized
  // once so ordering and filtering always agree.
  function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase() === "current" ? "current" : "past";
  }

  // Current projects first, then past, preserving JSON order within each.
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

    grid.textContent = ""; // idempotent if ever re-run
    grid.appendChild(fragment);
  }

  // One card: media frame, linked title, summary, tags — the markup the
  // shared .card styles expect.
  function buildCard(project) {
    const card = document.createElement("article");
    card.className = "card";

    card.appendChild(buildMedia(project));

    const body = document.createElement("div");
    body.className = "card-body";

    const heading = document.createElement("h2");
    heading.className = "card-title";
    const link = document.createElement("a");
    link.href = "project.html?id=" + encodeURIComponent(project.id);
    link.textContent = project.title || project.id;
    heading.appendChild(link);
    body.appendChild(heading);

    if (project.summary) {
      const summary = document.createElement("p");
      summary.className = "card-summary";
      summary.textContent = project.summary;
      body.appendChild(summary);
    }

    const tags = Array.isArray(project.tags) ? project.tags.filter(Boolean) : [];
    if (tags.length > 0) {
      const list = document.createElement("ul");
      list.className = "tags";
      list.setAttribute("aria-label", "Topics");
      tags.forEach(function (tag) {
        const item = document.createElement("li");
        item.className = "tag";
        item.textContent = tag;
        list.appendChild(item);
      });
      body.appendChild(list);
    }

    card.appendChild(body);
    return { element: card, status: normalizeStatus(project.status) };
  }

  // Fixed-aspect media frame (16:10, object-fit: cover via .card-media).
  // The frame keeps its soft background as a clean placeholder when the
  // thumbnail is missing or fails to load, so the grid never shows a
  // broken-image icon and rows stay aligned.
  function buildMedia(project) {
    const media = document.createElement("div");
    media.className = "card-media";

    if (project.thumbnail) {
      const image = document.createElement("img");
      image.src = project.thumbnail;
      image.alt = ""; // decorative — the title right below names the project
      image.setAttribute("loading", "lazy");
      image.setAttribute("decoding", "async");
      image.addEventListener("error", function () { image.remove(); });
      media.appendChild(image);
    }

    return media;
  }

  /* ------------------------------------------------------------------------ */
  /* Status filter                                                             */
  /* ------------------------------------------------------------------------ */

  function buildFilterBar() {
    if (!filterBar) return;

    // Only worth showing when both groups exist; otherwise every option
    // but "All" would be a dead end, so the bar stays empty (and hidden
    // via .status-filter:empty).
    const currentCount = cards.filter(function (c) { return c.status === "current"; }).length;
    if (currentCount === 0 || currentCount === cards.length) return;

    FILTERS.forEach(function (filter) {
      filterBar.appendChild(buildFilterButton(filter, filter.value === "all"));
    });
  }

  function buildFilterButton(filter, isPressed) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-btn";
    button.textContent = filter.label;
    button.dataset.status = filter.value;
    button.setAttribute("aria-pressed", String(isPressed)); // styling hooks off this
    button.addEventListener("click", function () { applyFilter(filter.value); });
    return button;
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
    // simply detached. No CSS involved, so the base grid can't break.
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