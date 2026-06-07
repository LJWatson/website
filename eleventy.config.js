import rssPlugin from '@11ty/eleventy-plugin-rss';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import slugify from 'slugify';
// import pluginPWA from 'eleventy-plugin-pwa';

import dateFilter from './src/filters/date-filter.js';
import w3DateFilter from './src/filters/w3-date-filter.js';
import parseTransform from './src/transforms/parse-transform.js';
import htmlMinTransform from './src/transforms/html-min-transform.js';

const EXCLUDED_TAGS = ['blog', 'all'];

export default config => {
// Put robots.txt in root
config.addPassthroughCopy({ 'src/robots.txt': '/robots.txt' });

  // Add filters
  config.addFilter('dateFilter', dateFilter);
  config.addFilter('w3DateFilter', w3DateFilter);

  // Plugins
  config.addPlugin(rssPlugin);
  config.addPlugin(syntaxHighlight);
  // config.addPlugin(pluginPWA, {
  //   globPatterns: [
  //     '**/*.{css,js,mjs,map,jpg,png,gif,webp,ico,svg,woff2,woff,eot,ttf,otf,ttc,json}'
  //   ]
  // });

  // Transforms
  config.addTransform('htmlmin', htmlMinTransform);
  config.addTransform('parse', parseTransform);

  // Returns a collection of blog posts in reverse date order
  config.addCollection('blog', collection => {
    return [...collection.getFilteredByGlob('./src/posts/*.md')].reverse();
  });

  config.addCollection('tags', collection => {
    const items = [];

    // Grabs every collection, finds items with tags and uses them to
    // populate the items array if they are not excluded
    collection.getAll().forEach(item => {
      if (!item.data.tags) {
        return;
      }
      item.data.tags
        .filter(tag => !EXCLUDED_TAGS.includes(tag))
        .forEach(tag => {
          items.push(tag);
        });
    });

    return [...new Set(items)].map(item => ({
      text: item,
      url: `/tag/${slugify(item.toLowerCase())}`
    }));
  });

  config.addCollection('categories', collection => {
    const items = [];

    // Grabs all items with categories and generates a loopable
    // collection of them
    collection.getAll().forEach(item => {
      if (!item.data.categories) {
        return;
      }

      let categories = item.data.categories;

      if (typeof categories === 'string') {
        categories = [categories];
      }

      categories.forEach(category => {
        items.push(category);
      });
    });

    return [...new Set(items)].map(item => ({
      text: item,
      url: `/category/${slugify(item.toLowerCase())}`
    }));
  });

  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  config.setUseGitIgnore(false);

  // Pass through
  config.addPassthroughCopy('./src/favicons/');
  config.addPassthroughCopy('./src/media/');
  config.addPassthroughCopy('./src/scripts/');
  
  // image minification is broken, pass-though copy instead. dph 2024/12/27
  config.addPassthroughCopy('./src/images/');
  
  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist'
    },
    passthroughFileCopy: true
  };
};

