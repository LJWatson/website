const rssPlugin = require("@11ty/eleventy-plugin-rss");

const PAGE_SIZE = 10;

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

function paginateItems(items, baseUrl) {
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push({
      posts: items.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
      pageNumber: i,
      totalPages,
      baseUrl,
      permalink: i === 0 ? baseUrl : `${baseUrl}page/${i}/`
    });
  }
  return pages;
}

module.exports = function blogFeature(eleventyConfig) {
  eleventyConfig.addFilter("filterBlogByCategory", (posts, category) => {
    return posts.filter(
      (post) => post.data.postCategories && post.data.postCategories.includes(category)
    );
  });

  eleventyConfig.addFilter("filterBlogByTag", (posts, tag) => {
    return posts.filter(
      (post) => post.data.postTags && post.data.postTags.includes(tag)
    );
  });

  eleventyConfig.addPlugin(rssPlugin);

  eleventyConfig.addCollection("blog", (collection) => {
    return [...collection.getFilteredByGlob("./src/posts/*.md")].reverse();
  });

  eleventyConfig.addCollection("postCategories", (collection) => {
    const categories = new Set();
    collection.getFilteredByGlob("./src/posts/*.md").forEach((post) => {
      if (post.data.postCategories) {
        post.data.postCategories.forEach((cat) => categories.add(cat));
      }
    });
    return Array.from(categories).sort();
  });

  eleventyConfig.addCollection("postTags", (collection) => {
    const tags = new Set();
    collection.getFilteredByGlob("./src/posts/*.md").forEach((post) => {
      if (post.data.postTags) {
        post.data.postTags.forEach((tag) => { if (tag) tags.add(tag); });
      }
    });
    return Array.from(tags).sort();
  });

  eleventyConfig.addCollection("postTagsWithCounts", (collection) => {
    const tagCounts = new Map();
    collection.getFilteredByGlob("./src/posts/*.md").forEach((post) => {
      if (post.data.postTags) {
        post.data.postTags.forEach((tag) => {
          if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  });

  eleventyConfig.addCollection("blogCategoryPages", (collectionApi) => {
    const allPosts = collectionApi.getFilteredByGlob("./src/posts/*.md").reverse();
    const categoriesMap = new Map();

    allPosts.forEach((post) => {
      if (post.data.postCategories) {
        post.data.postCategories.forEach((cat) => {
          if (!categoriesMap.has(cat)) categoriesMap.set(cat, []);
          categoriesMap.get(cat).push(post);
        });
      }
    });

    const pages = [];
    Array.from(categoriesMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([category, posts]) => {
      const slug = slugify(category);
      const baseUrl = `/blog/category/${slug}/`;
      paginateItems(posts, baseUrl).forEach((page) => {
        pages.push({ title: category, category, slug, ...page });
      });
    });

    return pages;
  });

  eleventyConfig.addCollection("blogTagPages", (collectionApi) => {
    const allPosts = collectionApi.getFilteredByGlob("./src/posts/*.md").reverse();
    const tagsMap = new Map();

    allPosts.forEach((post) => {
      if (post.data.postTags) {
        post.data.postTags.forEach((tag) => {
          if (!tagsMap.has(tag)) tagsMap.set(tag, []);
          tagsMap.get(tag).push(post);
        });
      }
    });

    const pages = [];
    Array.from(tagsMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([tag, posts]) => {
      const slug = slugify(tag);
      const baseUrl = `/blog/tag/${slug}/`;
      paginateItems(posts, baseUrl).forEach((page) => {
        pages.push({ title: tag, tag, slug, ...page });
      });
    });

    return pages;
  });
};
