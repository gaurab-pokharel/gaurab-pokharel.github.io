/* ==========================================================================
   dots.js — the faint dot grid behind the top band of each page.

   Loaded last on index.html, papers.html, projects.html, project.html and
   cv.html, after site.js and the page's own script.

   TO TURN THE DOT GRID OFF OR ON
   Change "enabled" in the settings block just below to false or true. That
   is the only edit needed to switch it everywhere. To switch it on one page
   only, change that page's line under "pages". Where it is off, this script
   adds nothing to the page and does no work.

   Where it draws
   Behind the band at the top of the page, from the rule under the header to
   the next rule down. It never runs under the header.
   • Home: the section with the headline and the portrait.
   • Papers, Projects, CV: the page heading (the title and the line under it).
   • A single project: the heading (back link, title, summary).
   A page gets the grid by wrapping that band in
   <div class="dot-band" data-dots="NAME">, where NAME is the page's name
   under "pages" below, and by loading this script.

   What it draws
   A grid of small gray dots.
   • A slow wave passes through the grid, so it is never completely still.
   • Dots near the pointer grow a little, turn teal and lean away from it.
   • The dots are kept faint behind the text on the left and fuller toward
     the right (on the home page, toward the portrait), and they fade out
     just above the bottom rule.
   • A dot with text in front of it is never drawn strong enough to take
     that text below the contrast WCAG AA asks for, even with the pointer
     right on it.

   What it does not do
   • Touch screens have no pointer, so there the grid only drifts.
   • Visitors who ask their system for reduced motion get a still grid.
   • It stops drawing while the band is scrolled out of view or the browser
     tab is in the background.

   The canvas is placed by the .dot-grid rule in assets/css/main.css
   (section 17c). The two colors are read from the design tokens there
   (--text-muted and --accent), so a change of palette carries over.
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     Settings. The first one is the switch.
     ---------------------------------------------------------------------- */

  const DOT_GRID = {
    enabled: true,   // true = the dot grid is on, false = off on every page

    // One line per page. Change a line to false to leave the grid off there.
    pages: {
      home: true,      // index.html
      papers: true,    // papers.html
      projects: true,  // projects.html
      project: true,   // project.html, the page of a single project
      cv: true         // cv.html
    },

    strength: 1,     // how visible the dots are. 1 is the level chosen in the
                     // mock-up; 0.5 is half as visible, 1.5 half again as much
    spacing: 28,     // distance between dots, in pixels
    reach: 120,      // how far the pointer's effect spreads, in pixels
    push: 5,         // how far dots beside the pointer lean away, in pixels
    drift: true,     // the slow wave that passes through the grid
    react: true      // whether dots respond to the pointer at all
  };

  /* ---------------------------------------------------------------------- */

  if (!DOT_GRID.enabled) return;

  // Most pages have their band in the HTML. The project page builds its
  // heading after its content has loaded, so there the band is watched for.
  const ready = document.querySelector(".dot-band");
  if (ready) {
    start(ready);
  } else if ("MutationObserver" in window) {
    const main = document.getElementById("content");
    if (main) {
      const watcher = new MutationObserver(function () {
        const band = main.querySelector(".dot-band");
        if (!band) return;
        watcher.disconnect();
        start(band);
      });
      watcher.observe(main, { childList: true, subtree: true });
    }
  }

  /** Put a dot grid behind one band and keep it running. */
  function start(band) {
    // The band names its page, and that page can be switched off above.
    if (DOT_GRID.pages[band.getAttribute("data-dots")] === false) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext ? canvas.getContext("2d") : null;
    if (!ctx) return;

    canvas.className = "dot-grid";
    canvas.setAttribute("aria-hidden", "true");
    band.insertBefore(canvas, band.firstChild);

    // main.css places the canvas behind the content. For a few minutes after
    // the site is updated, a browser can still be holding an older copy of
    // the stylesheet that has no rule for it. In that case step aside, so
    // the canvas does not push the page content down.
    if (window.getComputedStyle(canvas).position !== "absolute") {
      band.removeChild(canvas);
      return;
    }

    /** A design token such as "--accent" as [red, green, blue]. */
    function tokenColor(name, fallback) {
      const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      const match = /^#([0-9a-f]{6})$/i.exec(value);
      const hex = match ? match[1] : fallback;
      return [0, 2, 4].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); });
    }

    const REST = tokenColor("--text-muted", "6b6b64"); // a dot at rest
    const NEAR = tokenColor("--accent", "14655b");     // a dot beside the pointer
    const PAPER = tokenColor("--bg", "fbfaf8");        // the page the dots are drawn on
    const REST_CSS = "rgb(" + REST.join(",") + ")";
    const TAU = Math.PI * 2;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wideScreen = window.matchMedia("(min-width: 768px)");

    let width = 0;        // size of the band in CSS pixels
    let height = 0;
    let ratio = 1;        // canvas pixels per CSS pixel
    let columns = [];     // one entry per column of dots: { x, fade }
    let rows = 0;         // how many rows of dots fit in the band
    let ceiling = [];     // one entry per dot, row by row: the strongest it may be drawn
    let visible = true;   // false while the band is scrolled out of view
    let frameId = 0;      // the pending animation frame, 0 when none
    let tick = 0;

    /* The pointer, in canvas coordinates. x and y follow targetX and targetY
       with a small lag; presence eases between 0 (pointer away) and 1. */
    const pointer = {
      x: 0, y: 0, targetX: 0, targetY: 0,
      presence: 0, wanted: 0,
      clientX: 0, clientY: 0, seen: false
    };

    /* ------------------------------------------------------------------
       Keeping the text readable. A dot behind a word darkens the page at
       that spot, which lowers the contrast of the word a little. The
       functions below work out how strong a dot may get before text of a
       given color drops under the contrast WCAG AA asks for. measure()
       stores that ceiling for every dot that has text in front of it, and
       draw() never goes past it. With the settings and the text as they
       are, nothing changes while the pointer is away: a resting dot behind
       text is already fainter than that text's ceiling. It only holds back
       how dark a dot behind the gray lines or a link can turn when the
       pointer is on it.
       ------------------------------------------------------------------ */

    /** Relative luminance of [red, green, blue], as WCAG defines it. */
    function luminance(color) {
      const linear = color.map(function (value) {
        const v = value / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    }

    /** WCAG contrast ratio between two colors, from 1 to 21. */
    function contrast(a, b) {
      const first = luminance(a);
      const second = luminance(b);
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    }

    /** A computed color such as "rgb(107, 107, 100)" as numbers, or null. */
    function cssColor(value) {
      const match = /^rgba?\(([^)]+)\)$/.exec(value || "");
      if (!match) return null;
      const parts = match[1].trim().split(/[\s,\/]+/).map(parseFloat);
      if (parts.length < 3 || parts.some(function (part) { return isNaN(part); })) return null;
      return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
    }

    /**
     * True when the element, or something around it inside the band, has a
     * background of its own (a button, the job-market box). The dots do not
     * show through there, so that text needs no care.
     */
    function hasOwnBackground(element) {
      for (let node = element; node && node !== band; node = node.parentElement) {
        const color = cssColor(window.getComputedStyle(node).backgroundColor);
        if (color && color.alpha > 0) return true;
      }
      return false;
    }

    const ceilings = {};   // text color → the strongest a dot behind it may be

    /**
     * The strongest a dot may be drawn behind text of one color: the highest
     * opacity at which the text keeps the contrast AA asks for against the
     * dot (4.5 to 1, or 3 to 1 for large text), with a little to spare.
     */
    function ceilingFor(textColor, large) {
      const key = textColor.join(",") + (large ? " large" : "");
      if (ceilings[key] === undefined) {
        const wanted = (large ? 3 : 4.5) + 0.15;
        let lowest = 1;
        [REST, NEAR].forEach(function (dot) {
          // Search between "no dot" (0) and "a solid dot" (1) for the point
          // where the contrast crosses the figure wanted.
          let low = 0;
          let high = 1;
          for (let i = 0; i < 12; i++) {
            const middle = (low + high) / 2;
            const mixed = PAPER.map(function (value, c) { return value + (dot[c] - value) * middle; });
            if (contrast(textColor, mixed) >= wanted) low = middle; else high = middle;
          }
          lowest = Math.min(lowest, low);
        });
        ceilings[key] = lowest;
      }
      return ceilings[key];
    }

    /**
     * The text that has dots directly behind it: where each line of it is,
     * in canvas coordinates, and the ceiling for the dots behind it.
     */
    function textPieces(box) {
      const pieces = [];
      if (!document.createTreeWalker || !document.createRange) return pieces;

      const walker = document.createTreeWalker(band, NodeFilter.SHOW_TEXT, null);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || !/\S/.test(node.nodeValue) || hasOwnBackground(parent)) continue;

        const style = window.getComputedStyle(parent);
        const color = cssColor(style.color);
        if (!color || style.visibility === "hidden") continue;

        const size = parseFloat(style.fontSize) || 16;
        const bold = (parseInt(style.fontWeight, 10) || 400) >= 700;
        const limit = ceilingFor(color.rgb, size >= 24 || (bold && size >= 18.66));
        if (limit >= 0.6) continue;   // no dot is ever drawn that strong

        const range = document.createRange();
        range.selectNodeContents(node);
        const lines = range.getClientRects();
        for (let i = 0; i < lines.length; i++) {
          pieces.push({
            left: lines[i].left - box.left,
            right: lines[i].right - box.left,
            top: lines[i].top - box.top,
            bottom: lines[i].bottom - box.top,
            ceiling: limit
          });
        }
      }
      return pieces;
    }

    /**
     * Read the layout: the size of the band, and how strong each column of
     * dots should be. On a wide screen the dots are faint over the text on
     * the left and reach full strength on the right: at the portrait on the
     * home page, and seven tenths of the way across on the other pages. On
     * a phone, where everything is in one column, they are evenly faint.
     */
    function measure() {
      const box = band.getBoundingClientRect();
      width = Math.max(1, Math.round(box.width));
      height = Math.max(1, Math.round(box.height));
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);

      const content = band.querySelector(".container");   // the page's content column
      const photo = band.querySelector(".hero-photo");    // home page only
      const body = band.querySelector(".hero-body");
      const contentBox = content ? content.getBoundingClientRect() : box;
      const photoBox = photo ? photo.getBoundingClientRect() : null;
      const bodyBox = body ? body.getBoundingClientRect() : null;
      const left = contentBox.left - box.left;

      const besidePhoto = !!(photoBox && bodyBox && photoBox.width > 0 && bodyBox.right <= photoBox.left + 1);
      let fadeFrom = left + contentBox.width * 0.2;
      let fadeTo = 0;   // 0 means no ramp: an even, faint grid
      if (besidePhoto) {
        fadeTo = Math.max(fadeFrom + 1, photoBox.left - box.left - 20);
      } else if (!photo && wideScreen.matches) {
        fadeTo = left + contentBox.width * 0.7;

        // The muted line under a page title is the hardest text to read, so
        // the dots stay at their faintest all the way across it.
        const lede = band.querySelector(".page-lede");
        const ledeRight = lede ? lede.getBoundingClientRect().right - box.left : 0;
        if (ledeRight + 16 > fadeFrom) {
          fadeFrom = ledeRight + 16;
          fadeTo = Math.max(fadeTo, fadeFrom + contentBox.width * 0.3);
        }
      }

      // The grid lines up with the left edge of the page content.
      const step = DOT_GRID.spacing;
      const first = ((left % step) + step / 2) % step;
      columns = [];
      for (let x = first; x < width; x += step) {
        let fade = 0.7;
        if (fadeTo) {
          const t = Math.max(0, Math.min(1, (x - fadeFrom) / (fadeTo - fadeFrom)));
          fade = 0.3 + 0.7 * t * t * (3 - 2 * t);
        }
        columns.push({ x: x, fade: fade });
      }

      // How strong each dot may get. Most have no ceiling (1). A dot with
      // text in front of it gets the ceiling for that text's color.
      rows = 0;
      for (let y = step / 2; y < height; y += step) rows += 1;
      ceiling = [];
      for (let i = 0; i < rows * columns.length; i++) ceiling.push(1);

      // A dot leans up to "push" pixels from where it rests and is a few
      // pixels across, so the care starts that far outside each line of text.
      const clear = DOT_GRID.push + 3.5;
      textPieces(box).forEach(function (piece) {
        const fromColumn = Math.max(0, Math.ceil((piece.left - clear - first) / step));
        const toColumn = Math.min(columns.length - 1, Math.floor((piece.right + clear - first) / step));
        const fromRow = Math.max(0, Math.ceil((piece.top - clear - step / 2) / step));
        const toRow = Math.min(rows - 1, Math.floor((piece.bottom + clear - step / 2) / step));
        for (let row = fromRow; row <= toRow; row++) {
          for (let column = fromColumn; column <= toColumn; column++) {
            const index = row * columns.length + column;
            if (piece.ceiling < ceiling[index]) ceiling[index] = piece.ceiling;
          }
        }
      });
    }

    /** Draw every dot once. "now" is the time in milliseconds. */
    function draw(now) {
      const step = DOT_GRID.spacing;
      const strength = DOT_GRID.strength;
      const reachSquared = 2 * DOT_GRID.reach * DOT_GRID.reach;
      const time = DOT_GRID.drift && !reduceMotion.matches ? now * 0.0007 : 0;
      const presence = reduceMotion.matches ? 0 : pointer.presence;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      let row = 0;
      for (let y = step / 2; y < height; y += step, row += 1) {
        // Fade the last rows out so the dots do not crowd the rule below.
        const bottom = Math.min(1, (height - y) / 48);

        for (let i = 0; i < columns.length; i++) {
          const x = columns[i].x;

          // How strongly the pointer affects this dot: 1 right under it,
          // falling to nothing a few dots away.
          let near = 0;
          let offsetX = 0;
          let offsetY = 0;
          if (presence > 0) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const distanceSquared = dx * dx + dy * dy;
            near = presence * Math.exp(-distanceSquared / reachSquared);
            const distance = Math.sqrt(distanceSquared) || 1;
            offsetX = (dx / distance) * near * DOT_GRID.push;
            offsetY = (dy / distance) * near * DOT_GRID.push;
          }

          // The slow wave: a value between 0 and 1 that travels across the grid.
          const wave = DOT_GRID.drift ? 0.5 + 0.5 * Math.sin(x * 0.011 + y * 0.007 - time) : 0.5;

          // How visible this dot is, held under its ceiling where it has
          // text in front of it.
          const alpha = Math.min(
            ceiling[row * columns.length + i],
            Math.min(0.6, (0.051 + 0.034 * wave + 0.255 * near) * strength) * columns[i].fade * bottom
          );
          if (alpha < 0.003) continue;

          if (near < 0.01) {
            ctx.fillStyle = REST_CSS;
          } else {
            ctx.fillStyle = "rgb(" +
              Math.round(REST[0] + (NEAR[0] - REST[0]) * near) + "," +
              Math.round(REST[1] + (NEAR[1] - REST[1]) * near) + "," +
              Math.round(REST[2] + (NEAR[2] - REST[2]) * near) + ")";
          }
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, 0.9 + 0.25 * wave + 1.1 * near, 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    /** One animation frame: move the pointer along, draw, and ask for the next. */
    function frame(now) {
      frameId = 0;
      if (!visible || document.hidden || reduceMotion.matches) return;

      pointer.x += (pointer.targetX - pointer.x) * 0.14;
      pointer.y += (pointer.targetY - pointer.y) * 0.14;
      pointer.presence += (pointer.wanted - pointer.presence) * 0.09;
      if (pointer.wanted === 0 && pointer.presence < 0.004) pointer.presence = 0;

      // The wave is slow enough that every other frame is plenty; the pointer
      // gets every frame.
      tick += 1;
      const reacting = pointer.presence > 0;
      if (reacting || tick % 2 === 0) draw(now);

      if (DOT_GRID.drift || reacting || pointer.wanted > 0) {
        frameId = window.requestAnimationFrame(frame);
      }
    }

    /** Start the animation if it is not already running. */
    function wake() {
      if (!frameId && !reduceMotion.matches) frameId = window.requestAnimationFrame(frame);
    }

    /** Re-read the layout and redraw: on load, on resize, when content arrives. */
    function refresh() {
      measure();
      draw(window.performance.now());
      wake();
    }

    /** The same at the next frame. Several calls in a row make one refresh. */
    let refreshQueued = false;
    function refreshSoon() {
      if (refreshQueued) return;
      refreshQueued = true;
      window.requestAnimationFrame(function () {
        refreshQueued = false;
        refresh();
      });
    }

    /** Place the pointer from its last known position in the window. */
    function trackPointer() {
      if (!pointer.seen) return;
      const box = canvas.getBoundingClientRect();
      const x = pointer.clientX - box.left;
      const y = pointer.clientY - box.top;
      const margin = DOT_GRID.reach * 1.5;
      const close = x > -margin && x < box.width + margin && y > -margin && y < box.height + margin;

      // Arrive where the pointer is, instead of sweeping in from its last spot.
      if (pointer.presence === 0) {
        pointer.x = x;
        pointer.y = y;
      }
      pointer.targetX = x;
      pointer.targetY = y;
      pointer.wanted = close ? 1 : 0;
      if (close || pointer.presence > 0) wake();
    }

    if (DOT_GRID.react) {
      window.addEventListener("pointermove", function (event) {
        if (event.pointerType === "touch") return;
        pointer.clientX = event.clientX;
        pointer.clientY = event.clientY;
        pointer.seen = true;
        trackPointer();
      }, { passive: true });

      // Scrolling moves the page under a pointer that has not moved.
      window.addEventListener("scroll", trackPointer, { passive: true });

      // The pointer left the window.
      document.documentElement.addEventListener("pointerleave", function () {
        pointer.wanted = 0;
        pointer.seen = false;
        wake();
      });
    }

    // Keep the canvas the size of the band. The band grows when the page's
    // script fills in its text, and changes with the window.
    if ("ResizeObserver" in window) {
      new ResizeObserver(refresh).observe(band);
    } else {
      window.addEventListener("resize", refresh);
    }

    // Text can move without the band changing size: when the web fonts
    // arrive, or when a page script fills in a line. The dots that count as
    // being behind text have to follow it.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshSoon);
    if (document.fonts && document.fonts.addEventListener) {
      document.fonts.addEventListener("loadingdone", refreshSoon);
    }
    if ("MutationObserver" in window) {
      new MutationObserver(refreshSoon).observe(band, { childList: true, subtree: true, characterData: true });
    }

    // Pause while the band is out of view, and pick up again when it returns.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        if (visible) wake();
      }).observe(band);
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) wake();
    });

    // The page was brought back by the browser's Back or Forward button.
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) refresh();
    });

    // The visitor changed the reduced-motion setting while the page was open.
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", refresh);

    refresh();
  }
})();
