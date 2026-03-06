(function () {
  const root = document.documentElement;

  // Fade in on initial load
  root.classList.remove("is-transitioning");

  function isModifiedClick(e) {
    return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
  }

  function shouldIgnoreLink(a) {
    if (!a) return true;
    const href = a.getAttribute("href");
    if (!href) return true;

    // ignore external links, anchors, downloads, new tabs
    if (a.target === "_blank") return true;
    if (href.startsWith("#")) return true;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
    if (a.hasAttribute("download")) return true;
    if (a.dataset.projectModal) return true;

    // ignore cross-origin
    try {
      const url = new URL(href, window.location.href);
      return url.origin !== window.location.origin;
    } catch {
      return true;
    }
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    if (isModifiedClick(e)) return;
    if (shouldIgnoreLink(a)) return;

    e.preventDefault();
    const href = a.href;

    root.classList.add("is-transitioning");

    // navigate after fade-out
    window.setTimeout(() => {
      window.location.href = href;
    }, 220);
  });

  // Handle back/forward cache: ensure visible
  window.addEventListener("pageshow", () => {
    root.classList.remove("is-transitioning");
  });
})();