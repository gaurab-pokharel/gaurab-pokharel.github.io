module.exports = {
  eleventyComputed: {
    layout: (data) => {
      // Keep the listing page on the normal base layout
      if (data.page && data.page.filePathStem === "/projects/index") {
        return "layouts/base.njk";
      }
      // All project detail pages use the project layout
      return "layouts/project.njk";
    }
  }
};