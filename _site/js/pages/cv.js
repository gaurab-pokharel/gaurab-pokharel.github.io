const search = document.getElementById("cvSearch");
const items = Array.from(document.querySelectorAll("[data-cv-item]"));
const sections = Array.from(document.querySelectorAll("[data-cv-section]"));

function textOf(el) {
  return el.innerText.toLowerCase();
}

function setOpen(el, value) {
  if ("open" in el) el.open = value;
}

if (search) {
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();

    // If searching, open all section cards so matches are visible
    if (q !== "") sections.forEach(s => setOpen(s, true));

    for (const it of items) {
      const show = q === "" || textOf(it).includes(q);
      it.style.display = show ? "" : "none";

      // If it's a <details>, open matches while searching
      if (q !== "" && show) setOpen(it, true);
      if (q === "") setOpen(it, false);
    }
  });
}

const expandAll = document.getElementById("expandAll");
const collapseAll = document.getElementById("collapseAll");

expandAll?.addEventListener("click", () => {
  sections.forEach(s => setOpen(s, true));
  items.forEach(d => setOpen(d, true));
});

collapseAll?.addEventListener("click", () => {
  items.forEach(d => setOpen(d, false));
  sections.forEach(s => setOpen(s, false));
});