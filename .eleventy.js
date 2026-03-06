const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  const md = markdownIt({ html: true, linkify: true });
  eleventyConfig.addFilter("mdInline", (s) => md.renderInline(s || ""));

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    const d = new Date(dateObj);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });

  eleventyConfig.addFilter("navActive", (pageUrl, href) => {
    const norm = (s) => (s.endsWith("/") ? s : s + "/");
    const p = norm(pageUrl || "/");
    const h = norm(href || "/");
    if (h === "/") return p === "/";
    return p.startsWith(h);
  });

  eleventyConfig.addFilter("year", (dateObj) => {
    const d = new Date(dateObj);
    return String(d.getFullYear());
  });

  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });

  eleventyConfig.addCollection("projects", (api) => {
    return api
      .getFilteredByGlob("src/projects/*.md")
      .sort((a, b) => (b.date || 0) - (a.date || 0));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
