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

## Wishlists app

An invite-only family wishlists app at `/wishlists/`, specified in `docs/wishlists-spec.md`. It's the site's only server-side code. Pages are rendered by a Netlify Function using the site's own Nunjucks partials, data lives in Netlify Database (managed Postgres), and every page works without JavaScript. Nothing about the app goes into `dist/` apart from `css/wishlists.css`, so the sitemap and Pagefind never see it.

### Files

```
netlify/
  functions/
    wishlists.mjs           The function, routed at /wishlists and /wishlists/*
    wishlists-cleanup.mjs   Scheduled daily: purges used tokens, expired sessions, old audit entries
  database/migrations/      Plain SQL, applied by Netlify on deploy
  wishlists/
    app.mjs                 Request pipeline: session, Origin and CSRF checks, routing, flash messages
    routes/                 Handlers, one file per area. routes/index.mjs is the route table.
    views/                  The app's templates. layout.html includes the site's head, header and footer.
    render.mjs              Nunjucks (autoescape on) over views/ and src/_includes/
    lists.mjs               Lists and items queries, with the visibility and ownership rules
    reservations.mjs        Reservations. Never used to build a page for a list's owner.
    sessions.mjs, members.mjs, email.mjs, rate-limit.mjs, security.mjs, validation.mjs, ...
src/_data/wishlists_navigation.json   The app's navigation items
src/css/wishlists.css                 App-only styles, loaded after critical.css
src/js/wishlists.js                   Opens delete confirmations as a modal <dialog> (optional enhancement)
scripts/wishlists-local.mjs           Local runner (see below)
scripts/wishlists-create-admin.mjs    Creates the admin member
tests/wishlists/                      node:test tests against a real local Postgres
```

### How it fits the site

- `header.html` takes an optional `headerNavigation` (`{ label, items }`) in place of the website navigation. An empty `items` leaves the navigation out (logged-out pages). Items with `"method": "post"` render as a form button, which is how Log out works. `hideSearch` leaves out Pagefind.
- `head.html` skips the Pagefind stylesheet when `hideSearch` is set, and loads anything in `extraStylesheets`. The app passes `/css/wishlists.css` that way, because `check:css` expects every stylesheet named in `head.html` to belong to a feature pack.
- `sw.js` returns early for `/wishlists/`, so no app page goes into Cache Storage.
- `netlify.toml` pins both functions to Frankfurt (`fra`) and bundles the partials with `included_files`. Its `[[headers]]` for `/wishlists/*` don't apply to function responses, so the function sends the same security headers itself (`netlify/wishlists/http.mjs`).

### Security notes

- Every cookie uses the `__Host-` prefix. The session cookie holds a random 256-bit token, and only its SHA-256 hash is stored. The CSRF token is derived from the session token.
- POSTs must come from the same origin. `Referrer-Policy: no-referrer` makes browsers send `Origin: null` on form posts, so the check reads `Sec-Fetch-Site` first, then `Origin`, then `Referer`.
- The log-in code is hashed together with the pending log-in cookie, so it only works in the browser that asked for it. Wrong codes are counted per pending cookie for members and non-members alike, so the replies never reveal who's a member.
- Log-in emails are sent after the response (`context.waitUntil`), so response times don't reveal membership either.
- Deploy previews and branch deploys only send email to the admin's address, because their database branch is a copy of production.

### Lists and items

- Other members see a list only while it isn't archived and its owner isn't suspended. That rule lives in the queries in `lists.mjs` (`VISIBLE_TO_OTHERS`), not the templates. Owner-only actions look the list up by its ID and the owner's ID together, and items by item, list and owner, so changing an ID in the address gives a 404.
- Items keep their order in `position`. Move up and Move down swap positions with the neighbour inside a transaction that locks the list.
- An item's `updated_at` only changes when its details really change, not when it's moved, because it will drive the "Changed since you reserved it" notice.
- Delete links go to a confirmation page. With JavaScript, `wishlists.js` opens the same confirmation, rendered into the page as a `<dialog>`, instead. Cancel has focus when it opens, and closing it returns focus to the link.

### Reservations and surprise protection

- The owner's view of a list is built from `lists.mjs` alone, which never reads the `reservations` table. `routes/lists.mjs` (`listPage`) only calls `getReservationsForGiver` after checking the viewer isn't the owner, and that function throws if it is. The admin gets no exceptions on their own lists.
- Nothing the owner does gives anything away. Deleting, editing, moving or trying to reserve their own item looks the same whether or not it's reserved.
- A trigger (`wishlists_keep_reservations_of_deleted_item`) keeps reservations when their item is deleted, however that happens: by the owner, with its list, or when the owner is removed. It sets `item_id` to null and records the item in `item_snapshot`, so the reserver sees "Removed from Sam's list". A second trigger stops anyone reserving items on their own list, even outside the app.
- Reserving locks the item's row, so two members reserving the last one take turns. The second gets a clear error.
- `item_seen_at` holds the item's `updated_at` when the reserver last saw it. "Changed since you reserved it" shows until they mark it as seen.
- Bought is private to the reserver. `getReservationsForGiver` only reads back `status` for the viewer's own reservations, so other members' pages can only ever say "Reserved by". The reserver gets a single Bought toggle (`aria-pressed`), and My reservations splits each person's items into To buy and Bought.
- `tests/wishlists/surprise.test.mjs` is the safety net. It checks that every page an owner can open is byte-for-byte identical before and after others reserve, buy and cancel, for a member and for the admin. Run it after any change near lists, items or reservations.
- Confirmations never change the `<title>`. Only "Error:" does, after a failed POST. Without JavaScript, the confirmation is at the top of `main` and takes focus.
- With JavaScript, forms marked `data-enhance` (reserve, the Bought toggle, cancel, change how many, seen, move up and down) update in place. `wishlists.js` posts the form, follows the redirect, and replaces the `[data-live-container]` (`#items` on a list, `#reservations` on My reservations) with the same element from the page it gets back. There's no separate API: the server responds exactly as it does without JavaScript. Focus goes to an invalid field, the same button, its opposite (the Bought toggle posts to /bought/ or /reserved/, and Move up and Move down swap), or the item's heading. The confirmation or error goes to the `[data-live-announcer]` polite live region. If the page that comes back has no container, for example after being logged out, the form is sent the ordinary way.

### Running it locally

The Netlify CLI way is `npm run wishlists:dev` (`netlify dev`, with its local database). Without the CLI:

```
npm run build
npm run wishlists:local -- --admin you@example.test --name "Your name"
```

That starts a local Postgres in `.wishlists-local/` (ignored by git), applies the migrations, creates the admin if there isn't one, and serves the app at `http://localhost:8888/wishlists/` with the built site around it. Emails are printed to the terminal, including their log-in links and codes.

Tests: `npm run test:wishlists`. Each test file starts its own in-memory Postgres.

### Setting up production

1. Create the database in Netlify: Data & Storage > Database > Create a database manually.
2. Set the environment variables in Netlify, all with the Functions scope:
    - `SMTP_USER`, `SMTP_APP_PASSWORD` (as a secret) and `EMAIL_FROM`, for Production and Deploy Previews. Previews only email the admin's address.
    - `APP_BASE_URL` (`https://tink.uk`), for Production only. Without it, previews' email links use the preview's own address.
    - `WISHLISTS_ADMIN_EMAIL` and `WISHLISTS_ADMIN_NAME`, for Production and Deploy Previews. They create the admin (see below).
3. Deploy, so the migrations run. Netlify only gives functions new or changed variables on a new deploy.
4. Request a log-in email for the `WISHLISTS_ADMIN_EMAIL` address. While the database has no admin, that request creates the admin, and the email arrives as normal. Once there's an admin, the two variables do nothing. Each new database, including every deploy preview's branch, starts empty, so this happens once per database.

The alternative is `NETLIFY_DB_URL="<connection string>" node scripts/wishlists-create-admin.mjs <email> "<name>"`, with the connection string from `netlify database status --branch <branch> --show-credentials`.

To read the function's log, which says whether each log-in request matched a member and what the mail server replied: `netlify logs --deploy-id <id> --function wishlists --since 1h`. It can run a few minutes behind.

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
