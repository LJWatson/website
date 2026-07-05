# Feature Pack Conventions

Feature packs keep this boilerplate modular.

## Pack structure

Each pack lives at `feature-packs/<name>/` and should include:

- `plugin.js`: registers collections, filters, or shortcodes
- `manifest.json`: metadata used by install scripts
- `cms-config.yml`: optional Netlify CMS fragments merged by the installer
- `files/`: starter files copied into the project when enabled

Optional but recommended inside `files/`:

- `src/css/<name>.css`: styles loaded only when that feature flag is enabled

## Manifest shape

```json
{
  "featureFlag": "team",
  "mainNavigationItems": [
    {
      "text": "Team",
      "url": "/team/"
    }
  ],
  "footerNavigationItems": [],
  "cms": false
}
```

## Add a pack

1. Create `feature-packs/<name>/plugin.js`
2. Add `feature-packs/<name>/manifest.json`
3. Add starter files under `feature-packs/<name>/files/`
4. Add `feature-packs/<name>/cms-config.yml` if the pack needs CMS support
5. Add the feature flag to `features.json`
6. Load the pack conditionally in `.eleventy.js`
7. Add npm scripts for both `scripts/add-feature.js <name>` and `scripts/remove-feature.js <name>`
8. Load the pack CSS in `src/_includes/partials/head.html` if the pack has its own stylesheet

Current examples:

- `npm run add:blog`
- `npm run add:case-studies`
- `npm run add:changelog`
- `npm run add:faqs`
- `npm run add:navigation-menus`
- `npm run add:portfolio`
- `npm run add:services`
- `npm run add:testimonials`
- `npm run add:team`

Removal examples:

- `npm run remove:blog`
- `npm run remove:case-studies`
- `npm run remove:changelog`
- `npm run remove:faqs`
- `npm run remove:navigation-menus`
- `npm run remove:portfolio`
- `npm run remove:services`
- `npm run remove:testimonials`
- `npm run remove:team`

## Data conventions

Use shared field names where possible so packs feel interchangeable:

- `title`
- `metaDesc`
- `lede`
- `summary`
- `order`
- `featured`
- `slug`

Editable global content lives in `src/_data/site-content.json`.
Computed environment-aware site values stay in `src/_data/site.js`.

## Image conventions

Prefer these names before inventing a new field:

- `featureImage`
- `featureImageCaption`
- `image`
- `thumbnail`
- `avatar`
- `logo`
- `clientLogo`

## Layout naming

Use the existing capital city naming convention for new `data-layout` values.
Use `data-grid="4-5"`, `data-grid="4-6"`, or `data-grid="3-4"` on the same `.layout` element when a pack needs a different compound grid rhythm.

Run `npm run check:css` after CSS or template changes to catch layout-name drift, missing pack CSS hooks, and `transform` shorthand.
