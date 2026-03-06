

const TRANSITION_MS = 200;

const modalHtml = () => {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "projectModal";
  overlay.innerHTML = `
    <div class="modal-panel">
      <div class="modal-content"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
};

const getModal = () => document.getElementById("projectModal") || modalHtml();

let isClosing = false;
let fetchToken = 0;
let savedScrollY = 0;
let scrollLocked = false;

function scrollbarWidth() {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}


function lockScroll() {
  if (scrollLocked) return;
  scrollLocked = true;

  savedScrollY = window.scrollY || window.pageYOffset || 0;

  document.documentElement.style.setProperty("--sbw", `${scrollbarWidth()}px`);
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");

  window.scrollTo(0, savedScrollY);
  setTimeout(() => window.scrollTo(0, savedScrollY), 0);
}



function unlockScroll() {
  if (!scrollLocked) return;
  scrollLocked = false;

  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  document.documentElement.style.removeProperty("--sbw");

  window.scrollTo(0, savedScrollY);
  setTimeout(() => window.scrollTo(0, savedScrollY), 0);
}

function typesetMath(container) {
  try {
    // MathJax v3
    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
      // typesetPromise will typeset the given container
      window.MathJax.typesetPromise([container]).catch(() => {});
      return;
    }
    // KaTeX auto-render (if you ever add it)
    if (typeof window.renderMathInElement === "function") {
      window.renderMathInElement(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ]
      });
    }
  } catch (_) {}
}

function closeModal() {
  if (isClosing) return;

  const overlay = document.getElementById("projectModal");
  if (!overlay || !overlay.classList.contains("open")) return;

  const content = overlay.querySelector(".modal-content");

  isClosing = true;
  overlay.classList.remove("open");

  window.setTimeout(() => {
    if (content) content.innerHTML = "";
    unlockScroll();
    isClosing = false;
  }, TRANSITION_MS);
}

function openModal(href) {
  const overlay = getModal();
  const panel = overlay.querySelector(".modal-panel");
  const content = overlay.querySelector(".modal-content");

  const myToken = ++fetchToken;

  lockScroll();

  content.innerHTML = `
    <div class="project-detail-card" style="padding:18px;border-radius:18px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.22);">
      Loading…
    </div>
  `;

  overlay.classList.add("open");

  // Close by clicking outside
  overlay.addEventListener(
    "click",
    (e) => {
      if (e.target === overlay) closeModal();
    },
    { once: true }
  );

  // Close by Esc
  const onKey = (e) => {
    if (e.key === "Escape") {
      window.removeEventListener("keydown", onKey);
      closeModal();
    }
  };
  window.addEventListener("keydown", onKey);

  fetch(href, { credentials: "same-origin" })
    .then((r) => r.text())
    .then((html) => {
      if (myToken !== fetchToken) return;
      if (!overlay.classList.contains("open")) return;

      const doc = new DOMParser().parseFromString(html, "text/html");
      const card = doc.querySelector(".project-detail-card");
      const page = doc.querySelector(".project-page");

      if (card) {
        content.innerHTML = card.outerHTML;
      } else if (page) {
        content.innerHTML = page.innerHTML;
      } else {
        const main = doc.querySelector("main");
        content.innerHTML = main ? main.innerHTML : "<p>Could not load project content.</p>";
      }

      panel.scrollTop = 0;

      // Re-typeset LaTeX that was injected into the DOM
      typesetMath(content);
    })
    .catch(() => {
      if (myToken !== fetchToken) return;
      content.innerHTML = `
        <div class="project-detail-card" style="padding:18px;border-radius:18px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.22);">
          Failed to load project.
        </div>
      `;
    });
}

// Intercept clicks on project title links
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-project-modal]");
  if (!a) return;

  // allow open-in-new-tab etc.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();
  openModal(a.getAttribute("href"));
});


