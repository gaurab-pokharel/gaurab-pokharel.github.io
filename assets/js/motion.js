/* ==========================================================================
   motion.js — tells the browser which way to slide when a page opens.

   Loaded in the <head> of every page, before anything is drawn, because the
   browser asks for the direction just before it shows the new page.

   How the slide works
   • Moving between two pages of this site is animated by the browser's own
     page-transition feature ("view transitions"). The rule that switches it
     on and the animations themselves are in assets/css/main.css, section 17a.
   • This script adds one word to each transition: "forward" when the page
     being opened sits to the right of the old one in the nav (Home, Papers,
     Projects, CV), and "back" when it sits to the left. The CSS slides the
     content left or right to match. A project page sits just to the right
     of the Projects tab, so opening a project slides forward and going back
     to the list slides back.
   • When the direction is not known, the two pages cross-fade.

   Browsers without the feature (Firefox, at the time of writing) never run
   the two events below, and load pages as they always have. Visitors who ask
   their system for reduced motion get no transition either: the CSS switches
   the feature on only for everyone else.

   This file has no settings and needs no upkeep unless a tab is added to the
   nav. In that case add the new page's name to ORDER, in the tab's place.
   ========================================================================== */

(function () {
  "use strict";

  /* The pages in the order of their tabs, left to right, by file name
     without ".html". A page that lives inside a tab (a single project)
     comes straight after that tab's own page. */
  const ORDER = ["index", "papers", "projects", "project", "cv"];

  /* The page being left writes its name under this key, and the page being
     opened reads it. sessionStorage belongs to one browser tab and is cleared
     when the tab closes. */
  const STORE_KEY = "gp-last-page";

  /* Class put on <html> while the header should not be carried across on its
     own layer (see headerStaysPut below). The matching rule is in main.css. */
  const HEADER_OFF = "vt-header-off";

  const root = document.documentElement;

  /** "papers" for /papers.html, "index" for / and /index.html. */
  function pageName() {
    const file = window.location.pathname.split("/").pop().toLowerCase();
    return file.replace(/\.html?$/, "") || "index";
  }

  const here = pageName();

  /**
   * The header holds still during a slide. That only looks right when it is
   * in the same place on both pages, which means both are at the top. On a
   * scrolled page the header is left out, so it moves with the rest of the
   * page instead of flying in from above.
   */
  function headerStaysPut() {
    return window.scrollY <= 4;
  }

  // Leaving this page for another page of the site.
  window.addEventListener("pageswap", function () {
    try {
      window.sessionStorage.setItem(STORE_KEY, here);
    } catch (error) {
      // Storage is blocked: the next page falls back to a plain cross-fade.
    }
    root.classList.toggle(HEADER_OFF, !headerStaysPut());
  });

  // Arriving on this page. Also runs when the page is restored by the
  // browser's Back or Forward button.
  window.addEventListener("pagereveal", function (event) {
    const transition = event.viewTransition;
    if (!transition) {
      root.classList.remove(HEADER_OFF);
      return;
    }

    root.classList.toggle(HEADER_OFF, !headerStaysPut());
    const tidy = function () { root.classList.remove(HEADER_OFF); };
    transition.finished.then(tidy, tidy);

    let from = null;
    try {
      from = window.sessionStorage.getItem(STORE_KEY);
    } catch (error) {
      from = null;
    }

    const a = ORDER.indexOf(from);
    const b = ORDER.indexOf(here);
    if (a === -1 || b === -1 || a === b) return;
    if (transition.types) transition.types.add(b > a ? "forward" : "back");
  });
})();
