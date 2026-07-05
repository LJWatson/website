const markdownIt = require("markdown-it");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const features = require("./features.json");

// Filters
const dateFilter = require("./src/filters/date-filter.js");
const md = markdownIt({ html: true });
const isProduction = process.env.ELEVENTY_ENV === "production";

function minifyHtmlOutput(content, outputPath) {
  if (!isProduction || !outputPath || !outputPath.endsWith(".html")) {
    return content;
  }

  return content
    .replace(/<!--(?!\[if[\s\S]*?endif\]-->)[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  // Filters
  eleventyConfig.addFilter("dateFilter", dateFilter);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("slug", (str) => {
    if (!str) return "";
    return str
      .replace(/['']/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  });
  eleventyConfig.addFilter("markdown", (content) => {
    if (!content) {
      return "";
    }

    return md.render(content);
  });

  eleventyConfig.addTransform("optimizeHtml", (content, outputPath) => {
    return minifyHtmlOutput(content, outputPath);
  });

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" });
  eleventyConfig.addPassthroughCopy("src/images");

  if (features.blog) {
    const blogPlugin = require("./feature-packs/blog/plugin.js");
    blogPlugin(eleventyConfig);
  }

  if (features.caseStudies) {
    const caseStudiesPlugin = require("./feature-packs/case-studies/plugin.js");
    caseStudiesPlugin(eleventyConfig);
  }

  if (features.changelog) {
    const changelogPlugin = require("./feature-packs/changelog/plugin.js");
    changelogPlugin(eleventyConfig);
  }

  if (features.faqs) {
    const faqsPlugin = require("./feature-packs/faqs/plugin.js");
    faqsPlugin(eleventyConfig);
  }

  if (features.navigationMenus) {
    const navigationMenusPlugin = require("./feature-packs/navigation-menus/plugin.js");
    navigationMenusPlugin(eleventyConfig);
  }

  if (features.portfolio) {
    const portfolioPlugin = require("./feature-packs/portfolio/plugin.js");
    portfolioPlugin(eleventyConfig);
  }

  if (features.services) {
    const servicesPlugin = require("./feature-packs/services/plugin.js");
    servicesPlugin(eleventyConfig);
  }

  if (features.testimonials) {
    const testimonialsPlugin = require("./feature-packs/testimonials/plugin.js");
    testimonialsPlugin(eleventyConfig);
  }

  if (features.team) {
    const teamPlugin = require("./feature-packs/team/plugin.js");
    teamPlugin(eleventyConfig);
  }

  // Use .eleventyignore, not .gitignore
  eleventyConfig.setUseGitIgnore(false);

  // Directory structure
  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
