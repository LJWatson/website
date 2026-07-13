# tink.uk — Design Brief

## The site

A personal website for Léonie Watson. Not a corporate or organisational
site — content posted here is Léonie's own, not representative of
TetraLogical or W3C. The site identity is "tink", Léonie's longstanding
online handle.

## Audience

The general web community. Visitors will range from accessibility
practitioners who know Léonie's work well, to developers and designers
encountering her writing for the first time.

## Tone

Calm. Professional. Friendly. Approachable. Elegant.

The site should feel appropriate to someone with significant industry
experience and reputation, without being cold, corporate, or
unapproachable.

Explicitly not: noisy, messy, loud, trashy, tacky, amateurish.

---

## Content

### Pages
- Home (blog index — see routing note below)
- About Léonie (to be rewritten; will include a photograph)
- Elsewhere

### Blog
- Posts across categories: Web life, Real life, Code things, Desktop
  things, Recipe book, Mobile things
- Tags for cross-cutting topics
- Some posts include code examples, which must be legible and visually
  distinct in both themes
- Some posts include HTML `<video>` and `<audio>` elements with controls
- Disclosures used in some posts; media players may appear inside
  disclosures

### Blog index (homepage)
Each post listing shows, in order:
1. Post heading (links to full post)
2. Date
3. Excerpt
4. Category / tag metadata

### Removed features
- Talks archive (removed from redesign)
- Manual light/dark theme switcher



---

## Routing

The blog index is the homepage. When a visitor goes to https://tink.uk
they land directly on the blog post list, not a separate landing page.
The primary navigation link currently labelled "Blog" becomes "Home".

---

## Navigation

Primary navigation (unchanged from current site):
- Home (was: Blog)
- About Léonie
- Elsewhere

Social links — shown under a "Find me on" heading in the blog sidebar
(visible on the homepage and every post page) and on the contact page:
- Bluesky
- Mastodon
- GitHub
- LinkedIn

---

## Pagination

Numbered pagination on the blog index: 1, 2, 3… style.
Not "Older posts / Newer posts".

---

## Visual design

### Palette
Purples in the violet, amethyst, lilac, and lavender range. A touch of
grey is permissible where it serves the design. Full token set with
verified contrast ratios is documented in `tokens.css`.

### Theme
Light theme as default. Dark theme via `prefers-color-scheme: dark`.
No manual toggle. Both themes use the same semantic token names; only
the token values change.

### Typography
System font stack throughout — no webfonts, no third-party font services.

- Body / UI: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
  sans-serif`
- Code: `'Consolas', 'Monaco', 'Courier New', monospace`

Sans-serif chosen for readability. Code blocks use a monospace system
font and must be clearly visually distinguished from body text.

### Wordmark
"tink" as a typographic wordmark. Letters shift subtly across the purple
palette from violet to lavender (Option D). Not a logo — no iconography,
no container, no elaborate treatment. The shift should be noticeable on
closer inspection without announcing itself.

All letters in the wordmark must meet WCAG 2.2 AA contrast requirements
against the background in both themes. In the light theme this means
using the darker end of the purple range. In the dark theme, the lighter
end. The amethyst `#8B5CF6` must not be used for the wordmark at any
size where only 3:1 contrast applies — verify rendered size before use.

### Aesthetic qualities
- Light (as in: uncluttered, airy, not heavy)
- Comfortable to read
- Simple
- Elegant
- Focused on the content

### Media
- `<video>` and `<audio>` elements must have visible, styled, accessible
  controls in both themes
- Media players may appear inside disclosure elements — the disclosure
  interaction and media controls must each be independently keyboard
  operable
- A photograph of Léonie will appear on the About page — meaningful alt
  text required, not decorative

---

## Accessibility

WCAG 2.2 Level AA conformance is a hard requirement, not a goal.
This is non-negotiable.

Specific requirements:
- All text meets 4.5:1 contrast ratio against its background (normal text)
- Large text and UI components meet 3:1
- Focus indicators meet SC 2.4.11 Focus Appearance: minimum 2px,
  3:1 contrast against adjacent colours
- `:focus-visible` used to show focus rings for keyboard users without
  showing them for mouse users
- `prefers-reduced-motion` respected — all transitions and animations
  suppressed for users who request it
- Logical heading hierarchy on every page
- Skip to content link present and functional
- All images have appropriate alt text
- All interactive elements are keyboard operable
- No content that relies solely on colour to convey information
- Pagination controls are fully keyboard accessible and correctly
  labelled

---

## Technology

- Static site generator: Eleventy
- Starter kit: Eleventy in a Box Pro (Andy Clarke / Stuff & Nonsense)
- Hosting: TBD (Netlify configuration included in kit)
- No JavaScript frameworks
- `src/js/scripts.js` exists in the kit — to be used only where
  progressive enhancement requires it

### Search
Pagefind — browser-side, no third-party service, no privacy concerns.
Integrated at build time. Search input appears directly in the site
header, available on every page. Results appear inline as the user types.
No separate search page.

### PWA
The site will be a Progressive Web App from the initial build:
- Web app manifest
- Service worker for offline support
- Custom offline page (shown when a visitor requests an uncached page
  while offline)
- Appropriate meta tags

---

## Out of scope for initial build
- Comments
- Newsletter
- Any feature requiring a backend or third-party service
