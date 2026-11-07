export function loadConfig(env = process.env) {
  return {
    // Used for links in emails. APP_BASE_URL is set for production only. Without it, as on a
    // deploy preview, links use the address the request came in on (see app.mjs).
    baseUrl: (env.APP_BASE_URL || "").replace(/\/+$/, ""),
    emailFrom: env.EMAIL_FROM || "\"tink wishlists\" <wishlists@tink.uk>",
    smtpPassword: env.SMTP_APP_PASSWORD,
    smtpUser: env.SMTP_USER
  };
}
