import { initParticles } from "./bg/particles.js";
initParticles();

(function initNavShrink() {
  const nav = document.getElementById("siteNav");
  if (!nav) return;

  const threshold = 18;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const shouldShrink = window.scrollY > threshold;
      nav.classList.toggle("shrunk", shouldShrink);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();