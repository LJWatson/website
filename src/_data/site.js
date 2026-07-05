const siteContent = require("./site-content.json");

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeAssetPath(value) {
  const normalized = normalizeUrl(value);

  if (!normalized || normalized === "/") {
    return "";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function normalizeHrefPath(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("/")) {
    return normalized;
  }

  return `/${normalized.replace(/^\/+/, "")}`;
}

function normalizeSiteId(value) {
  const normalized = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "top";
}

function normalizeAnalytics(analytics = {}) {
  return {
    googleAnalyticsId: normalizeText(analytics.googleAnalyticsId),
    googleTagManagerId: normalizeText(analytics.googleTagManagerId),
    plausibleDomain: normalizeText(analytics.plausibleDomain),
    plausibleScriptSrc: normalizeText(analytics.plausibleScriptSrc) || "https://plausible.io/js/script.js",
    umamiScriptSrc: normalizeText(analytics.umamiScriptSrc) || "https://cloud.umami.is/script.js",
    umamiWebsiteId: normalizeText(analytics.umamiWebsiteId),
  };
}

function normalizeFonts(fonts = {}) {
  const mode = normalizeText(fonts.mode).toLowerCase();
  const normalizedMode = ["google", "none", "self-hosted"].includes(mode) ? mode : "none";

  return {
    googleFontsUrl: normalizeText(fonts.googleFontsUrl),
    mode: normalizedMode,
    preconnectGoogleFonts: fonts.preconnectGoogleFonts !== false,
    stylesheet: normalizeHrefPath(fonts.stylesheet),
  };
}

module.exports = function() {
  const absoluteUrl = normalizeUrl(
    process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || siteContent.url
  );
  const siteName = normalizeText(siteContent.name) || "Site name";

  return {
    ...siteContent,
    absoluteUrl,
    analytics: normalizeAnalytics(siteContent.analytics),
    assetPath: normalizeAssetPath(process.env.ASSET_PATH),
    fonts: normalizeFonts(siteContent.fonts),
    lang: normalizeText(siteContent.lang) || "en",
    locale: normalizeText(siteContent.locale) || "en_GB",
    metaDesc: normalizeText(siteContent.metaDesc),
    name: siteName,
    siteID: normalizeSiteId(siteContent.siteID || siteName),
    socialImage: normalizeText(siteContent.socialImage),
    socialImageAlt: normalizeText(siteContent.socialImageAlt),
    url: normalizeUrl(siteContent.url),
  };
};
