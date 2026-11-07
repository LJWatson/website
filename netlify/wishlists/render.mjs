import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";

const require = createRequire(import.meta.url);

// The site's partials and data files are bundled into the function with included_files.
// They keep their repository paths, so find the folder that holds them.
function findRoot() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [process.cwd(), path.resolve(here, "../.."), process.env.LAMBDA_TASK_ROOT].filter(Boolean);
  const root = candidates.find((candidate) => existsSync(path.join(candidate, "src/_includes/partials/header.html")));

  if (!root) {
    throw new Error(`Can't find the site templates. Looked in: ${candidates.join(", ")}`);
  }

  return root;
}

const ROOT = findRoot();
const fromRoot = (file) => require(path.join(ROOT, file));

const siteData = {
  features: fromRoot("features.json"),
  footer_navigation: fromRoot("src/_data/footer_navigation.json"),
  global: fromRoot("src/_data/global.js"),
  helpers: fromRoot("src/_data/helpers.js"),
  site: fromRoot("src/_data/site.js")()
};

const wishlistsNavigation = fromRoot("src/_data/wishlists_navigation.json");

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Europe/London" });
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/London" });

// autoescape is on, and members' text is never rendered as Markdown or HTML
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([path.join(ROOT, "netlify/wishlists/views"), path.join(ROOT, "src/_includes")]),
  { autoescape: true }
);

env.addFilter("json", (value) => JSON.stringify(value));
env.addFilter("date", (value) => (value ? dateFormat.format(new Date(value)) : ""));
env.addFilter("dateTime", (value) => (value ? dateTimeFormat.format(new Date(value)) : ""));
// "£30", "$29.99", "€12.50". narrowSymbol gives "$" rather than en-GB's "US$".
env.addFilter("price", (amount, currency) => {
  const value = Number(amount);

  return new Intl.NumberFormat("en-GB", {
    currency: currency || "GBP",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    style: "currency"
  }).format(value);
});

env.addFilter("plural",(count, word) => `${count} ${word}${count === 1 ? "" : "s"}`);

// The shop's name for item links: "Merino scarf at johnlewis.com"
env.addFilter("domain", (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
});

function headerNavigationFor(member) {
  const items = member
    ? wishlistsNavigation.items.filter((item) => item.role !== "admin" || member.role === "admin")
    : [];

  return { items, label: wishlistsNavigation.label };
}

// title: the page name. errors: a FormErrors. The <title> starts with "Error:" after a
// failed POST. Confirmations go in the page, not the title.
export function renderPage(ctx, template, data = {}) {
  const errors = data.errors && data.errors.any ? data.errors : null;
  const titlePrefix = errors ? "Error: " : "";

  return env.render(template, {
    ...siteData,
    csrfToken: ctx.csrfToken,
    extraStylesheets: ["/css/wishlists.css"],
    flash: errors ? null : ctx.flash,
    headerNavigation: headerNavigationFor(ctx.member),
    hideSearch: true,
    member: ctx.member,
    metaDesc: "Invitation-only family wishlists.",
    metaRobots: "noindex, nofollow",
    // The same "Page - tink" format as the rest of the site (partials/meta.html)
    metaTitle: `${titlePrefix}${data.title} - ${siteData.site.name}`,
    page: { url: ctx.path },
    ...data,
    errors
  });
}
