# Eleventy in a Box

Eleventy in a Box is a reusable Eleventy starter for blogs, brochure websites, and small editorial projects.
Optional add-on feature packs are available so you can add extra functionality when needed.

## What’s included

- Eleventy v3
- Netlify CMS admin at `/admin/`
- Neutral starter content and placeholder assets
- Feature-pack system for optional modules

## Installation

```bash
npm install
```

## Developing

```bash
npm run start
```

The development server runs at [http://localhost:8080](http://localhost:8080).

## Building

```bash
npm run build
```

Static files are written to `dist/`.
The build now clears `dist/` first, so stale output is removed automatically.

## Feature Packs

The base boilerplate is intentionally minimal.
Optional sections (for example, blog, FAQs, portfolio, and team) can be added as feature packs.
Reusable interface patterns, including alternate navigation treatments, can also be installed as packs.

- Feature flags are in `features.json`
- Pack code lives in `feature-packs/<name>/`
- Drop-in content/layout starter files live in `feature-packs/<name>/files/`
- Feature styles can live in `feature-packs/<name>/files/src/css/<name>.css` and are loaded only when enabled

### Adding the team pack

```bash
npm run add:team
```

This command:

1. Enables `"team": true` in `features.json`
2. Copies team layouts/content into `src/`
3. Adds `/team/` to both main and footer navigation
4. Merges the Team page and collection into `src/admin/config.yml`

### Adding the navigation menus pack

```bash
npm run add:navigation-menus
```

This command:

1. Enables `"navigationMenus": true` in `features.json`
2. Copies a reusable navigation menu partial, stylesheet, and data file into `src/`
3. Keeps the existing navigation items and swaps the header to a menu button pattern
4. Lets you choose between `"overlay-small"`, `"overlay-large"`, and `"slide"` in `src/_data/navigation_menu.json`

### Adding the blog pack

```bash
npm run add:blog
```

This command:

1. Enables `"blog": true` in `features.json`
2. Copies blog layouts/content into `src/`
3. Adds `/blog/` to `src/_data/navigation.json` if missing
4. Merges the Blog page and posts collection into `src/admin/config.yml`

### Adding the case studies pack

```bash
npm run add:case-studies
```

This command:

1. Enables `"caseStudies": true` in `features.json`
2. Copies case study layouts, content, and sample entries into `src/`
3. Adds `/case-studies/` to both main and footer navigation
4. Merges the case studies page and collection into `src/admin/config.yml`

### Adding the FAQs pack

```bash
npm run add:faqs
```

This command:

1. Enables `"faqs": true` in `features.json`
2. Copies FAQ layouts, content, and sample entries into `src/`
3. Adds `/faqs/` to both main and footer navigation
4. Merges the FAQ page and collection into `src/admin/config.yml`

### Adding the changelog pack

```bash
npm run add:changelog
```

This command:

1. Enables `"changelog": true` in `features.json`
2. Copies changelog layouts, content, and sample release entries into `src/`
3. Adds `/changelog/` to both main and footer navigation
4. Merges the changelog page and collection into `src/admin/config.yml`

### Adding the portfolio pack

```bash
npm run add:portfolio
```

This command:

1. Enables `"portfolio": true` in `features.json`
2. Copies portfolio layouts, content, and sample entries into `src/`
3. Adds `/portfolio/` to both main and footer navigation
4. Merges the portfolio page and collection into `src/admin/config.yml`

### Adding the services pack

```bash
npm run add:services
```

This command:

1. Enables `"services": true` in `features.json`
2. Copies service layouts, content, and sample entries into `src/`
3. Adds `/services/` to both main and footer navigation
4. Merges the services page and collection into `src/admin/config.yml`

### Adding the testimonials pack

```bash
npm run add:testimonials
```

This command:

1. Enables `"testimonials": true` in `features.json`
2. Copies testimonial layouts, content, and sample entries into `src/`
3. Adds `/testimonials/` to footer navigation
4. Merges the testimonials page and collection into `src/admin/config.yml`

You can preview changes without writing files:

```bash
node scripts/add-feature.js team --dry-run
node scripts/add-feature.js blog --dry-run
node scripts/add-feature.js case-studies --dry-run
node scripts/add-feature.js changelog --dry-run
node scripts/add-feature.js faqs --dry-run
node scripts/add-feature.js navigation-menus --dry-run
node scripts/add-feature.js portfolio --dry-run
node scripts/add-feature.js services --dry-run
node scripts/add-feature.js testimonials --dry-run
```

You can remove a pack the same way:

```bash
npm run remove:blog
npm run remove:case-studies
npm run remove:changelog
npm run remove:faqs
npm run remove:navigation-menus
npm run remove:portfolio
npm run remove:services
npm run remove:testimonials
npm run remove:team
```

The removal script:

1. Disables the pack feature flag in `features.json`
2. Removes installed pack files from `src/`
3. Removes manifest-driven navigation items
4. Removes CMS entries defined by the pack

By default, modified installed files are left in place. Use `--force` only when you want to remove those as well.

## Auditing

```bash
npm run check:boilerplate
npm run check:css
```

This checks the feature-pack wiring for:

1. Required pack files
2. Matching add/remove package scripts
3. Feature flags
4. Navigation entries
5. CMS fragments
6. Disabled packs that are still installed in `src/`

The CSS audit checks for:

1. `transform` shorthand usage
2. Undefined `data-layout` names in templates
3. Pack CSS files that are not wired through `head.html`
4. CSS links in `head.html` that do not point to a real pack stylesheet

## Content Model

- `src/index.md`: homepage
- `src/about.md`: about page
- `src/contact.md`: contact page
- `src/404.md`: 404 page
- `src/_data/site-content.json`: editable site content for the CMS
- `src/_data/site.js`: computed site data and environment-aware URL logic
- `src/_data/navigation.json`: main navigation
- `src/_data/footer_navigation.json`: footer navigation

## Layout system

Layouts use city names in `data-layout` and can change grid rhythm with `data-grid`.
The default rhythm is `4-5`.

```html
<div class="layout" data-layout="berlin">
```

Switch the same city recipe onto another compound grid:

```html
<div class="layout" data-layout="berlin" data-grid="4-6">
```

Available grid rhythms are `4-5`, `4-6`, and `3-4`.
The `4-6` rhythm shares the same named lines as `4-5` where possible, while `3-4` has a compact override layer for city recipes that need fewer `b` lines.

## Naming conventions

### Images

Use these names unless a pack has a specific reason not to:

- `featureImage`: page-level hero or lead image
- `featureImageCaption`: optional caption for `featureImage`
- `image`: main item image when the pack is not already using an established field name
- `thumbnail`: list or card image when the pack is not already using an established field name
- `avatar`: person image
- `logo`: brand or company mark
- `clientLogo`: client-specific logo inside case studies or similar work content

Keep new aliases to a minimum. Reuse an existing name when the meaning is already clear.

### Data

For index pages and content entries, prefer these fields where they fit:

- `title`
- `metaTitle`
- `metaDesc`
- `canonicalUrl`
- `ogTitle`
- `ogDescription`
- `ogType`
- `ogImage`
- `ogImageAlt`
- `lede`
- `summary`
- `order`
- `featured`
- `slug`

Editable site-wide content belongs in `src/_data/site-content.json`.
Computed values such as `absoluteUrl` and `assetPath` belong in `src/_data/site.js`.
Site-wide defaults for metadata and analytics also live in `src/_data/site-content.json`.
Font loading settings also live in `src/_data/site-content.json`.

## Netlify CMS

The CMS is configured for Git Gateway on the `main` branch. Before launching a real site:

1. Edit `src/_data/site-content.json` or use the CMS Globals section for contact details, default metadata, social images, analytics IDs, and font loading.
2. Replace the starter copy with project content.
3. Enable Netlify Identity and Git Gateway in your Netlify project.

## Fonts

Font loading is configurable in `src/_data/site-content.json` or the CMS Globals section:

- `fonts.mode`: `none`, `google`, or `self-hosted`
- `fonts.googleFontsUrl`: the full Google Fonts stylesheet URL when using `google`
- `fonts.preconnectGoogleFonts`: whether to add Google Fonts preconnect hints
- `fonts.stylesheet`: a local stylesheet path such as `/css/fonts.css` when using `self-hosted`

## Productising this boilerplate

If you want to package this starter as a commercial product, see [docs/sellable-boilerplate-checklist.md](docs/sellable-boilerplate-checklist.md).
It includes a practical launch checklist and the first files to tighten before charging for it.
