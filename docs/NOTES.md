# tink.uk — site notes

Personal reference notes covering how the site is built, the decisions made during the redesign, and the work done to get it to its current state.

## Tech stack

| Thing | What |
|---|---|
| Static site generator | [Eleventy](https://www.11ty.dev/) v3 (`@11ty/eleventy ^3.1.2`) |
| Templating | Nunjucks (`.njk`, `.html`) |
| Markdown processing | markdown-it v14 (`html: true`) |
| Date formatting | Luxon v3 |
| RSS feed | `@11ty/eleventy-plugin-rss` v1.0.7 |
| Search | Pagefind v1.3 (post-build index) |
| CSS minification | LightningCSS v1.32 (post-build) |
| Contact form | Netlify Forms (no backend needed) |
| Hosting | Netlify, deployed from GitHub |
| Source | `https://github.com/LJWatson` |

The starter kit this is based on is called **Eleventy in a Box**. Most of its optional feature packs (portfolio, services, case studies, etc.) are disabled. Only `blog: true` is active in `features.json`.

## Running the site locally

```
npm start          # dev server with live reload at localhost:8080
npm run build      # production build into dist/
npm run preview    # build then serve dist/ locally (required for search to work)
```

The production build:
1. Cleans `dist/`
2. Runs Eleventy with `ELEVENTY_ENV=production`
3. Minifies CSS via LightningCSS
4. Runs Pagefind to build the search index from the HTML output

Source lives in `src/`, output goes to `dist/`.

## Directory structure

```
src/
  _data/                  Global data files
    helpers.js            getLinkActiveState() and other template helpers
    site.js               Normalises site-content.json values
    site-content.json     Site configuration (name, URL, social handles, etc.)
    navigation.json       Primary navigation items
    footer_navigation.json  Footer navigation items

  _includes/
    layouts/
      base.html           Root layout: doctype, skip link, header, main, footer
      page.html           Single-column page (about, contact, privacy, etc.)
      feed.html           Blog listing (two-column: posts + sidebar)
      post.html           Individual post (two-column: content + sidebar)
      contact.html        Contact page (standalone — does not extend base.html)
    partials/
      head.html           <head> element
      meta.html           <title>, Open Graph, Twitter card tags
      header.html         Site header with wordmark, nav, search
      footer.html         Footer with nav links, Carpe diem wordmark, copyright
      wordmark.html       Per-letter coloured "tink" wordmark spans
      navigation.html     (not used — nav is inline in header.html)
      blog-sidebar.html   Shared sidebar: categories, tags, social links
      post-list.html      Renders a list of post summaries
      pagination.html     Numeric pagination for blog feed
      socials.html        Social icon + text links (Bluesky, Mastodon, GitHub, LinkedIn, RSS)
      icons/              SVG icons (all use fill="currentColor", aria-hidden="true")

  css/
    critical.css          Design tokens, reset, global styles, layout, components
    blog.css              Blog-specific styles (post list, sidebar, pagination, post page)

  js/
    scripts.js            Navigation menu dialog behaviour (IIFE)

  posts/
    *.md                  Blog posts (125 posts, 2009–2025)
    posts.json            Default frontmatter for all posts
    category.njk          Generates per-category listing pages
    tag.njk               Generates per-tag listing pages

  feed.njk                RSS feed at /feed.xml (20 most recent posts)

  index.md                Homepage (uses feed.html layout, paginates blog collection)
  about.md                About page
  contact.md              Contact page
  elsewhere.md            Conference talks, articles, radio appearances
  privacy.md              Privacy policy
  thanks.md               Post-contact-form success page

feature-packs/
  blog/
    plugin.js             Eleventy plugin: blog collections, category/tag page data

.eleventy.js              Eleventy config: plugins, filters, passthrough copy
features.json             Feature flags (only blog: true)
```

## How pages are built

Eleventy processes each source file through its template engine (Nunjucks) and layout chain. Most pages follow this chain:

```
page content → layout (e.g. page.html) → base.html → HTML output
```

`base.html` provides the outer HTML structure: doctype, `<html lang>`, `<head>`, skip link, `<header>`, `<main id="main-content">`, `<footer>`, and the scripts tag.

Layouts that use `{% extends "layouts/base.html" %}` (feed.html, post.html) can override the `{% block content %}` to take full control of the main content area. Layouts that use `layout:` in frontmatter (page.html, contact.html) have their rendered output injected via `{{ content | safe }}` inside base.html's default block, which also renders `<h1>{{ title }}</h1>` automatically.

### Blog collections

The blog plugin (`feature-packs/blog/plugin.js`) creates these Eleventy collections:

| Collection | What it contains |
|---|---|
| `blog` | All posts, reverse chronological |
| `postCategories` | Sorted array of unique category names |
| `postTags` | Sorted array of unique tag names |
| `postTagsWithCounts` | Tags sorted by frequency, with counts |
| `blogCategoryPages` | Paginated data objects for each category listing page |
| `blogTagPages` | Paginated data objects for each tag listing page |

Each post uses frontmatter:
```yaml
title: "Post title"
date: 2025-01-01
updated: 2025-06-01        # optional: date the post was last updated
postCategories: ["Category name"]
postTags: ["tag one", "tag two"]
postSummary: "One-sentence summary shown in the post list."
permalink: /custom-slug/   # only needed to override the default
```

The default permalink (from `posts/posts.json`) is `{{ title | slug }}/index.html`.

### RSS feed

`src/feed.njk` generates `/feed.xml` using the RSS plugin's `dateToRfc822`, `absoluteUrl`, and `getNewestCollectionItemDate` filters. It outputs the 20 most recent posts from `collections.blog`.

The `<link rel="alternate">` tag pointing to the feed is added in `head.html` when `features.blog` is true.

### Search

Pagefind runs after the build and indexes the HTML in `dist/`. The search box (`<pagefind-searchbox>`) is a web component loaded from `/pagefind/pagefind-component-ui.css` and initialised via `partials/pagefind.html`. The `<search>` landmark in the header wraps it.

## CSS architecture

All CSS lives in two files:

- **`critical.css`** — loaded on every page
- **`blog.css`** — loaded only when `features.blog` is true (all pages on this site)

### Design tokens

Everything uses CSS custom properties defined in `:root` in `critical.css`. The palette is a violet/purple scale:

```
violet-900 (#1A1025) → violet-800 → violet-700 → violet-600 → violet-500
amethyst-400 (#8B5CF6) → amethyst-300 → lilac-300 → lilac-200 → lilac-100
lavender-50 (#F5F3FF) → white (#FFFFFF)
muted-violet (#6B5A8A)
```

Semantic tokens map to raw palette values:

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | lavender-50 | violet-900 |
| `--color-text` | violet-900 | lavender-50 |
| `--color-text-secondary` | violet-700 | lilac-300 |
| `--color-text-muted` | muted-violet | amethyst-300 |
| `--color-accent` | violet-500 | amethyst-300 |
| `--color-accent-hover` | violet-600 | lilac-300 |
| `--color-border` | amethyst-400 | amethyst-400 |
| `--color-focus` | #7C3AED | lilac-300 |

### Dark theme

Dark theme uses `@media (prefers-color-scheme: dark)` only — there is no manual toggle. The token overrides are at the top of `critical.css`. Component-level dark overrides (buttons, skip link, summary hover) are in a dedicated section at the bottom of `critical.css`, and blog-specific dark overrides are at the bottom of `blog.css`.

### Focus

`:focus-visible` gets `outline: var(--focus-ring)` (3px solid, 8.11:1 contrast on light, 9.94:1 on dark). `:focus:not(:focus-visible)` removes the outline for mouse users. The `.btn[aria-pressed="true"]:focus-visible` rule reinstates the standard focus ring when a pressed toggle button is keyboard-focused (otherwise the pressed-state outline would override it at lower contrast).

### Layout

Two named grid layouts defined in `critical.css`:

| Name | Columns | Used on |
|---|---|---|
| `athens` | 2fr 1fr | Blog feed, post pages |
| `rome` | 1fr 2fr | About page |

Grids activate at `min-width: 48rem`. Below that, single column.

### CSS conventions (from AGENTS.md)

- Properties in alphabetical order within each rule
- No indentation (all rules at root level)
- Closing brace on same line as last property
- No transform shorthand (use `rotate:`, `translate:` etc.)
- No deep descendant selectors

---

## Accessibility

WCAG 2.2 Level AA is a hard requirement throughout.

### Key patterns

**Skip link** — visually hidden until focused, positioned fixed, moves into view on `:focus-visible`. Target is `<main id="main-content">`.

**Navigation active state** — `aria-current="page"` set via `helpers.getLinkActiveState()`. Current page link gets underline + `--color-text` colour. Same treatment applied to sidebar category/tag links.

**Toggle button (Elsewhere page)** — `<button aria-pressed="false">` pattern. JavaScript hides/shows older conference years using the `hidden` attribute. Progressive enhancement: content is fully visible without JS.

**Social links** — icon (SVG, `aria-hidden="true"`) followed by visible text label. All icons use `fill="currentColor"`.

**Wordmark** — the `<a aria-label="tink">` wraps `<span aria-hidden="true">` containing the per-letter coloured spans, so screen readers announce the link as "tink" rather than individual letters.

**`<details>`/`<summary>`** — used for "All tags" disclosure in the sidebar. Custom chevron indicator via `::after` pseudo-element.

**Contrast** — all text and UI component colours were verified against WCAG 1.4.3 (text, 4.5:1 normal / 3:1 large) and 1.4.11 (non-text, 3:1) during the redesign.

## Content conventions

**British English** throughout — "colour" not "color" in content (CSS uses American English as per CSS spec).

**Sentence case** for all post titles and h2 headings. Rules:
- First word capitalised
- Proper nouns capitalised (names, brands, places)
- Acronyms preserved (ARIA, WCAG, HTML, CSS, SVG, etc.)
- Pronoun "I" capitalised
- Everything else lowercase

**Post summaries** — `postSummary` frontmatter field, shown in the post list. Not all posts have one yet.

## Site data

Configured in `src/_data/site-content.json`:

- Site name: tink
- URL: https://tink.uk
- Copyright owner: Léonie Watson
- Language: en-GB
- Social: Bluesky, Mastodon (@tink@front-end.social), GitHub (LJWatson), LinkedIn

No analytics are configured. The privacy policy states: no cookies, no tracking, no analytics.

## Deployment

The site deploys to Netlify automatically from GitHub. `npm run build` is the build command. Output directory is `dist/`.

The contact form uses Netlify Forms (`data-netlify="true"`, `name="contact-form"`). On successful submission, the user is redirected to `/thanks/`. The form includes a honeypot field (`name="bot-field"`, wrapped in `<p hidden>`) for spam filtering.

To check for broken links before deploying:
```
npm run build
npx linkinator ./dist --recurse --format csv > link-report.csv
```
Filter the CSV for anything other than status 200. Note: LinkedIn (999), some BBC pages, and other sites that block crawlers will show false positives.

## What was done during the redesign (2026)

This is a record of the significant work done during the qa-checks/add-content phase.

### Content and structure
- Added 125 blog posts migrated from the previous site
- Converted all post titles and h2 headings to sentence case
- Added `postSummary` frontmatter to a number of posts
- Wrote privacy policy page content
- Wrote thanks page
- Updated the Elsewhere page with conference talks, articles, and radio appearances
- Added explicit permalink (`/tag-youre-it/`) to fix a 404 caused by an apostrophe in the post title "Tag, you're it"
- Deleted unused starter kit files: `docs.md`, `blog.md`, `home.html`, unused feature pack layouts, placeholder social images

### Features added
- RSS feed at `/feed.xml` using `@11ty/eleventy-plugin-rss`
- RSS icon added to social links in `socials.html`
- "Previous years" toggle button on the Elsewhere page (progressive enhancement, `aria-pressed` pattern)
- Two-column layout on individual post pages (post content + sidebar)
- Shared `blog-sidebar.html` partial used by both feed and post layouts
- Social links moved into the blog sidebar under "Find me on" heading
- "Carpe diem" footer wordmark with smooth per-letter colour gradient (9 steps, violet-700 → amethyst-400 light, lavender-50 → amethyst-300 dark)
- `aria-current="page"` on matching category/tag link in sidebar when on a category or tag listing page

### Accessibility fixes
- `--color-border` changed from `lilac-300` to `amethyst-400` to pass SC 1.4.11 (was ~1.77:1, now ~3.65:1+)
- Dark theme component overrides added so button, skip link, and summary text use `--violet-900` on accent backgrounds (was failing contrast)
- Social icon SVGs changed from hardcoded `fill="#dfab4d"` to `fill="currentColor"` (was ~1.89:1 on light background)
- Social links updated to show visible text labels alongside icons; SVGs given `aria-hidden="true"`
- `.btn[aria-pressed="true"]:focus-visible` rule added to reinstate standard focus ring on pressed toggle button
- `data-content="posts"` attribute added to post layout's first column so sidebar styles apply consistently on post pages
- Broken Netlify link in privacy page corrected
- Category and tag listing pages given dynamic `<title>` elements via JS frontmatter `eleventyComputed`
- Footer navigation links given `text-decoration: none` to match nav/sidebar link treatment
- Sidebar category/tag links given `aria-current="page"` and matching visual treatment

### Removed
- Manual colour scheme toggle (JavaScript IIFE and associated CSS) — site now relies on `prefers-color-scheme` only
- `rss.html` (conflicted with `feed.njk` for the `/feed.xml` permalink)
- Unused starter kit layouts and placeholder images
