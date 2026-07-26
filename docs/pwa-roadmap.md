# tink.uk — PWA implementation brief

## Context

tink.uk is an Eleventy v3 static site (source in `src/`, output to `dist/`, hosted on Netlify). The [design brief](design-brief.md) requires PWA support from the initial build — manifest, service worker, offline page, meta tags — but it was never implemented. This brief scopes the remaining work. Read `docs/claud.md` (house style: vanilla JS, plain CSS, no frameworks, no third-party services) and `docs/NOTES.md` (site architecture) first.

## Already done

- **Icon design decided and source asset added**: `src/images/icon.svg` — a 512×512 rounded-square (22% corner radius) icon, violet-900 (`#1A1025`) background with the wordmark's lowercase "t" glyph in lavender-50 (`#F5F3FF`), system-ui bold. This reuses the existing dark-theme wordmark letter colour pairing rather than inventing a new one.

## Remaining steps, in order

1. **Rasterize the icon.** No image tool is currently available in this repo (no ImageMagick/Inkscape/rsvg-convert/sharp installed). Need PNGs at 512×512, 192×192, apple-touch-icon (180×180), and standard favicon sizes (32×32, 16×16), plus a **maskable** variant with the "t" padded into the inner ~80% safe zone (Android adaptive icons crop to shape). Likely path: `npm install sharp` + a small one-off Node script reading `icon.svg`.

2. **Web app manifest.** Add `src/manifest.webmanifest` — `name`/`short_name` "tink", `description` from `site.metaDesc`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `background_color: "#F5F3FF"`, `theme_color: "#6D28D9"` (matches the existing `<meta name="theme-color">` tags in `head.html`), `lang: "en-GB"`, and an `icons` array referencing the rasterized PNGs (192, 512, plus the maskable one with `"purpose": "maskable"`). Add to passthrough copy in `.eleventy.js`.

3. **Wire it into `<head>`.** In `src/_includes/partials/head.html`, add `<link rel="manifest" href="/manifest.webmanifest">`, `<link rel="icon">` (favicon), and `<link rel="apple-touch-icon">`. None of these exist yet — currently the site has zero icon-related tags.

4. **Service worker.** Add `src/sw.js`, passthrough-copied to the site root so its scope covers everything. Recommended strategy: cache-first (or stale-while-revalidate) for static assets (`css`, `js`, `images`, `fonts`), network-first for HTML documents (so content stays fresh, falling back to cache/offline page only when the network fails). Bump the cache name on each deploy so stale caches get cleared. Be careful with Pagefind's generated assets under `/pagefind/` — they're content-hashed per build, don't hardcode them into a precache list.

5. **Custom offline page.** Add `src/offline.md` (layout: `layouts/page.html`, permalink `/offline/`), tone matching the rest of the site (calm, friendly — see `design-brief.md`). Precache it in the service worker's install step; serve it as the fallback for failed navigation requests while offline.

6. **Registration script.** Small progressive-enhancement snippet in `src/js/scripts.js` (or a new file passthrough-copied alongside it): feature-detect `'serviceWorker' in navigator`, then `navigator.serviceWorker.register('/sw.js')`. Vanilla JS only, per house style.

7. **Verify.** Run a Lighthouse PWA audit, test "Add to Home Screen" on Android and iOS to confirm the icon renders correctly (including the maskable crop), and test actual offline behaviour via DevTools (Application → Service Workers → Offline). Re-run `npm run build` + the existing linkinator check to confirm no regressions. Confirm Netlify Forms and Pagefind search still work unaffected — the service worker must not intercept or cache form POSTs.

## Constraints to carry through every step

- WCAG 2.2 AA applies to the offline page like every other page (headings, skip link, focus styles — reuse the existing layout rather than a bespoke one).
- No third-party services or CDNs — everything self-hosted, consistent with the rest of the site.
- `prefers-reduced-motion` and the existing dark/light theme tokens apply if the offline page or any update-available UI needs styling.
- Follow the CSS conventions in `docs/claud.md` (alphabetical properties, no indentation, closing brace on the same line) for anything added to `critical.css`/`blog.css`.
