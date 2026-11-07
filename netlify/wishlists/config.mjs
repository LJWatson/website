export function loadConfig(env = process.env) {
  return {
    // First-time set-up: who becomes the admin while there isn't one yet (see members.mjs)
    adminEmail: (env.WISHLISTS_ADMIN_EMAIL || "").trim().toLowerCase(),
    adminName: (env.WISHLISTS_ADMIN_NAME || "").trim(),
    // Used for links in emails. APP_BASE_URL is set for production only. Without it, as on a
    // deploy preview, links use the address the request came in on (see app.mjs).
    baseUrl: (env.APP_BASE_URL || "").replace(/\/+$/, ""),
    emailFrom: env.EMAIL_FROM || "\"Wishlists\" <wishlists@tink.uk>",
    smtpPassword: env.SMTP_APP_PASSWORD,
    smtpUser: env.SMTP_USER
  };
}
