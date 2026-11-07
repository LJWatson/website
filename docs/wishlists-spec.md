# Wishlists specification

7 November 2026 · Léonie Watson

## Purpose and scope

An invite-only webapp at `https://tink.uk/wishlists/` that lets family members create wishlists, browse each other's lists, and reserve items without the list owner finding out.

### In scope

- Invitation-only membership, administered by Léonie
- Passwordless log-in by email magic link, with a session that survives browser and device restarts
- Each member can create and manage their own wishlists
- Every member can see every other member's lists
- Members can reserve items on someone else's list and mark them as bought
- Reservation status is never shown to the list owner
- Uses the tink.uk design tokens, layouts, header and footer

### Not in scope

- A link to the app in the main or footer navigation
- Search engine indexing, the sitemap or the Pagefind search index
- Public or shareable-by-link lists
- Self-registration
- Payments, price tracking or affiliate links
- Native mobile apps (the existing PWA manifest is enough)

### Constraint from the existing site

The design brief puts "any feature requiring a backend or third-party service" out of scope. This app is the site's first server-side code. It's an accepted exception to the brief, limited to the `/wishlists/` path and its API.

## Users, roles and invitations

There are two roles. Léonie is the only admin, and only the admin can invite people.

| Role | Can do |
| --- | --- |
| Admin | Everything a member can do; invite people; resend or revoke invitations; suspend, reinstate or remove members; change a member's display name or email address |
| Member | Manage their own profile, lists and items; view every other member's lists; reserve, unreserve and mark items as bought on other members' lists |

### Invitation flow

1. Admin enters the invitee's email address and display name on the Members page.
2. The system emails a single-use invitation link. It expires after 7 days.
3. The invitee opens the link and confirms their display name. That logs them in and creates a persistent session.
4. An expired or used invitation link shows a page saying so, with no detail about the account. The admin can resend.

### Membership rules

- An email address can belong to one member only.
- A suspended member can't log in. Their lists are hidden from other members, but their data is kept.
- Removing a member deletes their profile, lists and items. Their reservations on other people's lists are deleted too, so those items show as available again. The admin must confirm before removal.
- The admin account can't be removed or suspended from inside the app.

## Authentication

Members log in with a single-use emailed link, and then stay logged in on that browser until they log out or the session is revoked. There are no passwords.

### Log-in flow

1. The member enters their email address on `/wishlists/log-in/`.
2. The page always replies "If that address belongs to a member, we've emailed a log-in link", so it doesn't reveal who's a member.
3. The email holds a link carrying a random token of at least 256 bits. Only a hash of the token is stored. It expires after 15 minutes and works once.
4. Opening the link shows a confirmation page with a "Log in" button. The button submits a POST that uses the token.
5. On success the server creates a session and redirects to `/wishlists/`.

The confirmation step in point 4 matters because corporate email security tools (Microsoft Defender Safe Links and similar) prefetch links in emails. If a plain GET used the token, the scanner would spend it and the member's click would fail.

### Log-in code (for the iOS home-screen app)

Every log-in email holds both the link and a 6-digit code. Either one logs the member in, and using one cancels the other.

- **Why:** a web app on the iOS home screen keeps its own storage, separate from Safari's, and links in Mail always open in Safari. A member who starts logging in from the home-screen app can't finish with the link. They can type the code into the app instead.
- **Browser binding:** requesting a log-in sets a short-lived, `HttpOnly` pending log-in cookie in that browser. The code works only in the browser holding that cookie, so a code seen over someone's shoulder, or on a lock screen, is useless anywhere else. The link isn't bound, so it works on any device.
- **Limits:** the code expires with the link, after 15 minutes. After 5 wrong entries the code is cancelled and the member has to request a new email.
- **Entry field:** one text field, not six separate boxes. It has `inputmode="numeric"`, `autocomplete="one-time-code"` and a visible label, and pasting is allowed. A Log in button submits it; the form doesn't submit itself automatically. iOS can fill the code in from Mail.
- **Email:** the subject is "Log into Wishlists". The email gives the link, the bare URL and the code, and says that from the home screen you need to use the code.
- **Installing the app:** iOS 17.2 and later copy login cookies into a web app when it's added to the home screen ([firt.dev iOS PWA notes](https://firt.dev/notes/pwa-ios/)). The help page tells members to log in in Safari first, then add the app to their home screen. They'll only need the code if that session ends.
- **Considered and deferred:** passkeys. WebAuthn works on iOS, but passkeys mean more to build, and lost-device recovery would still need email.

### Persistent sessions

- The session cookie is `HttpOnly`, `Secure`, `SameSite=Lax`, named with the `__Host-` prefix, which requires `Path=/` and no `Domain` attribute. Server-side routing keeps it in use only under `/wishlists/`.
- `Max-Age` is 400 days, which is Chrome's maximum cookie lifetime. The expiry slides forward at most once a day while the member uses the app.
- Sessions live in the database so they can be revoked. The cookie holds only a random session ID.
- Each member can see their active sessions (device, browser, last used) and log out of one or all of them.
- The admin can revoke all of a member's sessions. Suspension and removal revoke them automatically.
- Sessions are per browser. A second device or browser needs its own log-in.

### Known issues to design and test for

- **Safari tracking prevention.** Safari limits the lifetime of some cookies. A first-party cookie set by the server's HTTP response on the same origin should keep its full lifetime, but verify that on iOS and macOS Safari before launch.
- **Email deliverability.** Log-in depends on email reaching people. Mail goes through mailbox.org, which tink.uk's SPF, DKIM and DMARC records already cover (see Email set-up).
- **Rate limiting.** No more than 5 link requests per email address per hour, and per IP address. Failed token attempts are throttled.

### Why not Netlify Identity

Netlify reversed its February 2026 decision to deprecate Netlify Identity, according to a [community post](https://answers.netlify.com/t/netlify-identity-is-staying-feb-2026-reversal-what-changed-whos-affected-and-how-to-proceed/162733) that hasn't been officially confirmed. Its client libraries keep JWT and refresh tokens in JavaScript-readable storage, which doesn't fit the HttpOnly cookie model above. A small custom auth layer in Netlify Functions gives full control over the flow, the emails and the session lifetime. Revisit this if the custom layer turns out to cost too much to maintain.

## Functional requirements

### Surprise protection (the core rule)

A list owner must never be able to find out the reservation or bought status of their own items. That holds in every place they could look:

- Pages, HTML source, API responses, error messages and emails sent to the owner
- Counts and ordering. For example, "3 of 5 items available" or sorting reserved items to the end would give it away.
- What the owner's own actions trigger. Deleting a reserved item or lowering its quantity must look exactly the same to the owner as it does for an unreserved item.
- Field-level enforcement on the server. Reservation data is removed from the query when the requester owns the list. Hiding it in the template isn't enough.

One limit can't be engineered away: if the owner uses a browser where another member is logged in, they'll see that member's view. The help text should say so.

### Lists

- A member can have any number of lists, such as "Christmas 2026" or "Birthday".
- List fields: title (required), occasion date (optional), description (optional).
- The owner can create, rename, edit, archive, unarchive and delete their lists.
- Archived lists are hidden from other members and kept for the owner.
- Deleting a list:
    - The owner confirms on a page, or in a `<dialog>` when JS is on, that names the list and says how many items it holds. Deletion is permanent.
    - The list and all its items are deleted. Reservations on those items are kept, with `item_id` set to null and `item_snapshot` filled in. Each reserver's My reservations page shows the item as "Removed from [owner]'s list".
    - The confirmation and the result look exactly the same whether or not any items were reserved (see surprise protection).
    - The admin can delete any member's list, following the same rules.
- After the occasion date passes, the owner is prompted to archive the list. Nothing is revealed to them.

### Items

| Field | Required | Notes |
| --- | --- | --- |
| Name | Yes | Up to 200 characters |
| Link | No | One URL, `https` only, opened as a normal link |
| Price | No | Free text, so "about £30" works |
| Quantity wanted | No | Whole number, defaults to 1 |
| Most wanted | No | Yes or no flag |
| Similar is fine | No | Yes or no flag |
| Notes | No | Plain text, up to 1,000 characters, line breaks kept |

- The owner can add, edit, reorder and delete items. Reordering uses Move up and Move down buttons, not drag and drop.
- Images aren't in scope for the first release.

### Reservations

- A member can reserve some or all of the remaining quantity of an item on someone else's list.
- A member can tick their own reservation as bought, untick it, or cancel it. Bought is private to them: it organises their My reservations page and nobody else ever sees it.
- Other members (not the owner) see whether each item is reserved and by whom, so gifts aren't duplicated. They see "Reserved by Sam" whether or not Sam has bought it.
- A member can't reserve items on their own lists.
- A "My reservations" page lists everything the member has reserved, grouped by person, with each person's items split into To buy and Bought.
- When the owner edits a reserved item, the reserver sees a "Changed since you reserved it" notice. When the owner deletes one, the reserver's My reservations page shows that it was removed.
- Two members reserving the last unit at the same time: the first write wins, and the second member sees a clear error.

### Pages

| Page | Path | Who |
| --- | --- | --- |
| Log in | `/wishlists/log-in/` | Anyone |
| Accept invitation | `/wishlists/invite/` | Holder of a valid invitation |
| Everyone's lists | `/wishlists/` | Members |
| A member's lists | `/wishlists/people/<id>/` | Members |
| A list | `/wishlists/lists/<id>/` | Members (owner view or giver view) |
| Add or edit item | `/wishlists/lists/<id>/items/...` | List owner |
| My lists | `/wishlists/mine/` | Members |
| My reservations | `/wishlists/reservations/` | Members |
| Account and sessions | `/wishlists/account/` | Members |
| Members | `/wishlists/admin/members/` | Admin |

### Notifications (first release)

- Email for invitations and log-in links only.
- No activity emails. Optional digests, such as "Alex added 3 items", are a later release.

## Data model

There are seven relational tables. Reservations sit in their own table so the owner's queries never join to them.

| Table | Key fields | Notes |
| --- | --- | --- |
| `members` | `id`, `email` (unique, lower-cased), `display_name`, `role` (admin or member), `status` (active or suspended), `created_at` | One admin row, created by a setup script, not the UI |
| `invitations` | `id`, `email`, `display_name`, `token_hash`, `invited_by`, `expires_at`, `used_at` | Single use, 7-day expiry |
| `login_tokens` | `id`, `member_id`, `token_hash`, `code_hash`, `pending_cookie_hash`, `failed_code_attempts`, `expires_at`, `used_at`, `requested_ip` | One row per email. The link or the code uses it up. 15-minute expiry, cancelled after 5 wrong codes, purged after 24 hours. |
| `sessions` | `id` (random, 256-bit), `member_id`, `created_at`, `last_used_at`, `expires_at`, `user_agent_summary` | Deleted on log-out, revocation, suspension or removal |
| `lists` | `id`, `owner_id`, `title`, `description`, `occasion_date`, `archived_at`, `created_at`, `updated_at` | |
| `items` | `id`, `list_id`, `name`, `url`, `price_text`, `quantity`, `most_wanted`, `similar_ok`, `notes`, `position`, `updated_at` | `updated_at` drives the "Changed since you reserved it" notice |
| `reservations` | `id`, `item_id`, `reserver_id`, `quantity`, `status` (reserved or bought), `item_snapshot`, `created_at`, `updated_at` | `item_snapshot` keeps the name and link if the owner deletes the item |

### Access rules, enforced in the data layer

- **Owner reading their own list:** items only. The query never touches reservations.
- **Another member reading a list:** items plus a count and status of reservations per item, and the reservers' display names.
- **Write checks:** a member can only change rows they own. A reservation's `reserver_id` must not equal the list's `owner_id`.
- **Deletions:** deleting an item keeps its reservations, with `item_id` set to null and `item_snapshot` filled in, so the reserver can see what was removed.

## Architecture and integration

Pages are rendered on the server by Netlify Functions using the site's own Nunjucks partials, and data lives in managed Postgres. Every page works without JavaScript. Forms use plain POST and redirect-after-POST.

### Components

| Part | Choice | Why |
| --- | --- | --- |
| Hosting | Existing Netlify site | Same domain, same deploys from GitHub |
| Request handling | One Netlify Function routed at `/wishlists/*` | One place for auth, routing and access rules |
| Templates | Nunjucks, using `src/_includes/partials/head.html`, `header.html` and `footer.html` | The same markup and design as the rest of the site. The partials are bundled into the function with `included_files`. |
| Styles | `critical.css` plus a new `wishlists.css` | Uses the existing tokens, focus ring and dark theme. Follows the CSS conventions in `docs/claud.md`. |
| JavaScript | Optional enhancement only, in vanilla JS | For example, confirm-before-delete using `<dialog>`, with a server-side confirmation page when JS is off |
| Database | Netlify Database (managed Postgres) on the existing Netlify Pro credit-based plan | Reservations need transactions and row locking to stop double booking. Netlify Blobs is key-value storage with no transactions, so it doesn't fit. Pro keeps scheduled backups for 30 days. |
| Functions region | Frankfurt (`eu-central-1`), which Pro allows | Keeps request handling in the EU. Ask Netlify support, in writing, whether Netlify Database then sits in the same region, because it isn't documented. |
| Email | mailbox.org SMTP (`smtp.mailbox.org`, port 465), with an application password limited to SMTP | Uses the existing provider and DNS records. Sent with `nodemailer`. |

Server-rendering keeps the app out of Eleventy's build output. That means the sitemap and Pagefind don't pick it up, and nothing about the app ships in `dist/`.

### Rejected alternative

Eleventy-built static pages filled in by client-side JavaScript calling a JSON API. Without JavaScript the pages would be empty. It would also mean reproducing the page state in JS, plus more live-region and focus-management work, for no gain at family scale.

### Changes to the existing site

| File | Change |
| --- | --- |
| `src/sw.js` | Return early for any URL under `/wishlists/` so no app pages or responses go into Cache Storage. Bump `CACHE_VERSION`. |
| `src/robots.txt` | Add a `User-agent: *` group with `Disallow: /wishlists/` |
| `src/privacy.md` | Rewrite it (see Privacy) |
| `netlify.toml` | Function config, `included_files` for the partials, and response headers for `/wishlists/*` (see Security) |
| `src/_data/navigation.json`, `footer_navigation.json` | No change. The app isn't linked. |
| `src/_data/wishlists_navigation.json` | New. Holds the app's navigation items, in the same shape as `navigation.json`. |
| `src/_includes/partials/header.html` | Render the items and `aria-label` passed in by the page, falling back to `navigation.items` and "Website". This keeps one header markup pattern for both. Add a flag that leaves out the Pagefind search on app pages, if that's the decision (see open questions). |
| `package.json` | Add `nunjucks`, `@netlify/database` and `nodemailer`, and a `netlify dev` script for local work |
| `docs/NOTES.md` | Add an architecture section for the app |

### In-app navigation

On app pages, the wishlists navigation takes the place of the website navigation in the site header. The website navigation doesn't appear on them.

- The header markup and styling stay the same: `<nav data-navigation-body="bar" aria-label="Wishlists">`, using the same list structure and `helpers.getLinkActiveState()` for `aria-current="page"`.
- Items for logged-in members: Everyone's lists, My lists, My reservations, Account, Help, Log out. The admin also gets Members. Log out is a POST form button styled to sit with the links, not a link.
- Pages for logged-out people (log in, accept invitation, link expired) show no navigation items. The header shows only the wordmark.
- The wordmark keeps linking to the tink.uk home page, so there's still a way back to the main site.
- The footer is unchanged, including its links to the main site.

### Configuration

- Environment variables: `SMTP_USER`, `SMTP_APP_PASSWORD`, `EMAIL_FROM`, `APP_BASE_URL`. Netlify Database supplies its own connection.
- Database migrations are plain SQL files in `netlify/database/migrations/`. Netlify runs them on deploy.
- Deploy previews get their own database branch, which Netlify creates automatically. Each branch starts as a copy of production data, so previews must only ever be shared with the admin. Sending email from previews is turned off, or limited to the admin's address.
- `netlify dev` runs a local Postgres for development.
- On the Pro plan, the database can be set to stay awake rather than sleep after 5 minutes idle. Decide after measuring how slow the first request is after it wakes.

## Accessibility

WCAG 2.2 AA is a hard requirement, the same as in the site's design brief, and every existing site pattern carries over: skip link, focus ring, tokens and contrast, reduced motion. The points below are the ones specific to this app.

### Success criteria that need deliberate design

| SC | How the app meets it |
| --- | --- |
| 3.3.8 Accessible Authentication (Minimum) | Magic link: no password, no cognitive test. The log-in code supports paste and autofill (`autocomplete="one-time-code"`), so the member never has to remember it. |
| 2.2.1 Timing Adjustable | The 15-minute link expiry is a security limit on the token, not on a page the member is using. No form times out, and sessions last 400 days. |
| 2.5.7 Dragging Movements | Items are reordered with Move up and Move down buttons |
| 4.1.3 Status Messages | When JS is on, inline updates such as reserving an item are announced in a polite live region |
| 3.3.1, 3.3.3 Error identification and suggestion | After a failed POST, the page re-renders with "Error:" at the start of `<title>`, an error summary at the top of `main` that takes focus and links to each field, and inline messages tied to fields with `aria-describedby` |
| 3.3.7 Redundant Entry | Values entered in a failed form are kept when the form re-renders |
| 3.2.6 Consistent Help | One help link in the same place in the in-app navigation on every page |
| 2.4.11 Focus Not Obscured (Minimum) | No sticky headers or footers in the app |

### Patterns

- **Confirmation after redirect.** A successful POST redirects to a page whose `main` begins with a message container that takes focus. The `<title>` doesn't change, except for "Error:" at the start after a failed POST. This works without JavaScript.
- **In-place updates.** With JavaScript, item actions (reserve, mark as bought or not, cancel, change how many, mark changes as seen, move up and down) send their form in the background and update the item where it is. Focus stays with the item, and the result is announced in a polite live region.
- **Item markup.** Each item is a block with the item name as a heading (`h2` on a list, `h4` under To buy and Bought on My reservations), so members can move through items by heading. Status (Available, Reserved by Sam) is text, never just colour or an icon.
- **Button names.** Buttons say what they act on: "Reserve Merino scarf", using visually hidden text where the visible label is just "Reserve".
- **Destructive actions.** Delete opens a confirmation page, or a modal `<dialog>` when JS is on, that names the thing being deleted. Focus goes back to a sensible place afterwards.
- **Quantity.** Native `<input type="number">` with a visible label and stated minimum and maximum. No custom spin buttons.
- **External links.** The item link is a normal link that opens in the same tab. Its text is the item name plus the shop's domain, so it isn't just "Link".
- **Emails.** Plain text with an HTML alternative. A descriptive link phrase plus the bare URL. No images.

### Testing

- Screen readers: JAWS with Chrome and Edge, NVDA with Firefox, VoiceOver with Safari on macOS and iOS, TalkBack with Chrome on Android
- Keyboard-only run through every flow, including invitation, log-in, log-out and session revocation
- 400% zoom and reflow at 320 CSS pixels wide
- Windows forced-colours mode, in both light and dark themes
- Automated checks (axe or similar) in CI on rendered pages from a seeded test database. These supplement manual testing and don't replace it.

## Security

Access control is checked on the server on every request, and nothing under `/wishlists/` is cached, indexed or framed.

### Response headers for `/wishlists/*`

| Header | Value |
| --- | --- |
| `Cache-Control` | `no-store` |
| `X-Robots-Tag` | `noindex, nofollow` |
| `Content-Security-Policy` | `default-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'; object-src 'none'`, plus `'wasm-unsafe-eval'` in `script-src` only if Pagefind stays in the header |
| `Referrer-Policy` | `no-referrer`, so item links don't send list URLs to shops |
| `X-Content-Type-Options` | `nosniff` |
| `Clear-Site-Data` | `"cache", "cookies", "storage"` on the log-out response only |

### Requirements

- **CSRF:** every state-changing request is a POST carrying a per-session token. The server also checks the `Origin` header, and `SameSite=Lax` is a third layer.
- **Authorisation:** every handler checks session, membership status and ownership. Record IDs are random UUIDs, so they can't be guessed or counted.
- **Output encoding:** the function's Nunjucks environment has `autoescape: true`. Members' text is never rendered as Markdown or HTML. The site's `markdown-it` set-up uses `html: true` and mustn't be reused here.
- **URL fields:** accept only `https:` URLs up to 2,000 characters. Rejecting `javascript:` and `data:` follows from that.
- **Tokens:** login, invitation, session and CSRF tokens come from a cryptographically secure random source. Login and invitation tokens are stored only as SHA-256 hashes and compared in constant time.
- **Rate limits:** the log-in limits in Authentication, plus a general per-session limit on POSTs.
- **Logging:** never log tokens, cookies or email bodies. Keep a small audit log of admin actions (invite, suspend, remove, revoke sessions) for 12 months.
- **Secrets:** stored only in Netlify environment variables. Nothing secret goes in the repo or in `site-content.json`.
- **Backups:** daily database backups kept for 30 days, and one restore tested before launch.
- **Dependencies:** keep runtime dependencies to a minimum, in line with house style. Turn on Dependabot or equivalent for the function's packages.

## Privacy and data protection

The app stores family members' names, email addresses and gift preferences, and sets one strictly necessary cookie. It collects nothing else.

- **Legal position:** UK GDPR doesn't apply to processing "by a natural person in the course of a purely personal or household activity" (Article 2(2)(c)). A family wishlist run by an individual very likely falls under that, but this isn't legal advice. The spec follows good practice either way.
- **Cookies:** the session cookie is strictly necessary for a service the member asked for, so PECR doesn't require consent. No analytics, tracking or third-party cookies.
- **Privacy page:** `src/privacy.md` currently says "This website uses no cookies". Rewrite it to say the main site sets no cookies, and the invitation-only wishlists app sets one log-in cookie. Then cover what the app stores, why, where (Netlify and mailbox.org) and how to have it deleted.
- **Processors and location:** Netlify for hosting, functions and the database; mailbox.org (Germany) for email. Record the database region once Netlify confirms it.
- **Minimisation:** no dates of birth, addresses or phone numbers. IP addresses are kept only on login tokens, for rate limiting, and deleted with them after 24 hours.
- **Retention:** sessions expire after 400 days of inactivity. Used and expired tokens are purged daily. Lists and items are kept until their owner or the admin deletes them.
- **Deletion:** a member can delete their own account from Account. The same rules as admin removal apply.
- **Children:** if any members are under 13, their accounts should be managed by a parent or guardian (see open questions).

## Testing and acceptance criteria

The first release is done when every criterion below passes in production, with a seeded test family of at least 3 members.

### Surprise protection

- [ ] Logged in as a list owner, no page, HTML source, API response or email shows whether, or how many of, their items are reserved or bought
- [ ] An owner deleting a reserved item gets exactly the same response, wording and redirect as for an unreserved one
- [ ] An owner deleting a list gets exactly the same confirmation and result whether or not any of its items were reserved. Affected reservers see the removed items on My reservations.
- [ ] An automated test asserts that owner-view responses contain no reservation fields

### Access

- [ ] Anyone not logged in who requests a `/wishlists/` URL, other than log-in and invitation, is redirected to log-in and sees no data
- [ ] A suspended or removed member's existing session stops working on their next request
- [ ] A member can't edit another member's lists or items by changing IDs or form fields
- [ ] Invitation and log-in links work once, and expire on time
- [ ] A log-in link survives a link prefetch, tested with a plain GET request
- [ ] The log-in code works only in the browser that requested it, is cancelled after 5 wrong entries, and stops working once the link has been used
- [ ] On an iPhone running iOS 17.2 or later, a member can log in inside the home-screen app using the code, and stays logged in after force-quitting the app and restarting the phone

### Sessions

- [ ] Still logged in after closing and reopening Chrome, Edge, Firefox and Safari, and after restarting the device
- [ ] Session lifetime checked on iOS and macOS Safari across at least 8 days, to confirm tracking prevention doesn't cut it short
- [ ] "Log out everywhere" ends all of the member's sessions

### Integration with the site

- [ ] `/wishlists/` appears in no navigation, `sitemap.xml` or Pagefind index
- [ ] App pages show the wishlists navigation and not the website navigation. Main site pages are unchanged.
- [ ] The service worker caches nothing under `/wishlists/`, checked in DevTools Cache Storage after a full session
- [ ] Response headers match the Security section
- [ ] The rest of tink.uk builds and behaves exactly as before, checked with `npm run build` and the linkinator check

### Accessibility

- [ ] Every flow passes the manual screen reader and keyboard testing listed in Accessibility
- [ ] No WCAG 2.2 AA failures found in a full audit of every page template and state, including errors, empty lists and confirmations

## Open questions and defaults to confirm

These are working defaults. Each one changes scope if it's overturned.

- [ ] **Header search on app pages:** keep the Pagefind search, which searches the blog, or leave it out? Default: leave it out.
- [ ] **Lists for someone else:** should a parent manage lists for a child or an older relative without an email address? Default: not in the first release.
- [ ] **Reveal after the occasion:** never reveal reservations to the owner, even after the date? Default: never.
- [ ] **Who reserved it:** should other members see the reserver's name, or only that the item is reserved? Default: show the name.
- [ ] **Item images:** allow an image URL or upload? Default: no.
- [ ] **Database region:** get written confirmation from Netlify support of where Netlify Database stores data once functions are set to Frankfurt.
- [ ] **Sending account:** send from the main mailbox.org account using an alias, or from a separate mailbox.org account just for the app? See Email set-up. Default: a separate account.
- [ ] **Separate repository:** keep the app in the website repo, which is simplest, or put it in its own Netlify site proxied at `/wishlists/`, which isolates failures and dependencies? Default: same repo.

### Database decision

Netlify Database, on the existing Netlify Pro credit-based plan. Checked 7 November 2026:

- Pro keeps scheduled daily backups for 30 days, plus a backup before each of the last 10 production deploys. Only a Team Owner can restore.
- A restore can't be rolled back except through Netlify support, and rolling back a deploy doesn't roll back the database.
- Compute costs 10 credits per compute unit. Data out costs 20 credits per GB.
- Storage is free for now. Netlify has said storage billing will start "no earlier than" 1 July 2026, but hasn't published a rate.
- Where the data is stored isn't documented (see open questions).

## Email set-up

Log-in and invitation emails go through mailbox.org over SMTP, so no separate email service is needed.

### Why this works

- tink.uk's SPF, DKIM and DMARC records already authorise mailbox.org. Mail it sends from a tink.uk address passes them without any DNS changes.
- mailbox.org application passwords can be limited to SMTP only, so the credential stored in Netlify can send mail but can't read the mailbox ([mailbox.org app passwords](https://kb.mailbox.org/en/private/security-privacy-article/email-app-passwords)).
- Volume is tiny: invitations, plus a log-in email whenever a session ends.
- The data stays with a provider already in use, based in Germany.

### Risks and how they're handled

| Risk | Handling |
| --- | --- |
| mailbox.org temporarily blocks sending if it suspects abuse. It has no fixed daily limit and judges each account on its usual volume ([mailbox.org sending limits](https://kb.mailbox.org/en/business/e-mail/is-there-a-limit-on-the-amount-of-e-mails-that-i-can-send-from-my-account/)). On the main account, a block would stop personal email too. | Use a separate mailbox.org account just for the app, and keep the log-in rate limits |
| Anyone who gets the app password can send mail as that account | The separate account limits the damage to `wishlists@tink.uk`. Rotate the password if it might have leaked. |
| No delivery logs, bounce webhooks or delivery reporting | Bounces arrive in the sending account's inbox. Check it now and then. |
| SMTP is slower than an HTTP email API | One TLS connection per email from the function is fine at this volume |

### Steps

1. Create the sending address: a separate mailbox.org account for `wishlists@tink.uk` (recommended), or an alias on the main account.
2. Turn on two-factor authentication for that account, then create an application password limited to SMTP.
3. Store the address and app password in Netlify as `SMTP_USER` and `SMTP_APP_PASSWORD`, scoped to production. Leave them out of deploy previews.
4. Set `EMAIL_FROM` to `"Wishlists" <wishlists@tink.uk>`. Replies go to that mailbox, or the email says replies aren't read.
5. Check the existing DMARC policy (`p=`). If it's `quarantine` or `reject`, send test emails to Gmail, Outlook.com and iCloud addresses before launch and confirm they arrive and pass.
6. Connect from the function to `smtp.mailbox.org` on port 465 using implicit TLS.

### Sources

- [firt.dev iOS PWA compatibility notes](https://firt.dev/notes/pwa-ios/)
- [Netlify Database overview](https://docs.netlify.com/build/data-and-storage/netlify-database/)
- [Netlify Database billing, limits and compliance](https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/)
- [Netlify Database backup and recovery](https://docs.netlify.com/build/data-and-storage/netlify-database/backup-and-recovery/)
- [Netlify credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
- [mailbox.org email configuration](https://kb.mailbox.org/en/business/e-mail/e-mail-configuration)
- [mailbox.org app passwords](https://kb.mailbox.org/en/private/security-privacy-article/email-app-passwords)
- [mailbox.org sending limits](https://kb.mailbox.org/en/business/e-mail/is-there-a-limit-on-the-amount-of-e-mails-that-i-can-send-from-my-account/)
- [Third-party research on Netlify Database's region](https://github.com/thomaseckhardt/skizunft-site/issues/5)
- [Netlify Identity reversal, community summary](https://answers.netlify.com/t/netlify-identity-is-staying-feb-2026-reversal-what-changed-whos-affected-and-how-to-proceed/162733)
- [Netlify full-stack primitives map](https://www.netlify.com/knowledge-base/netlify-fullstack-primitives-map/)
- Website repo: `docs/design-brief.md`, `docs/NOTES.md`, `docs/claud.md`, `docs/pwa-roadmap.md`, `src/sw.js`, `src/privacy.md`, `src/_includes/`
