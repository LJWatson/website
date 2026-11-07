import { getDatabase } from "@netlify/database";
import { createApp } from "../wishlists/app.mjs";
import { loadConfig } from "../wishlists/config.mjs";
import { smtpTransport } from "../wishlists/email.mjs";

let handle;

export default async (request, context) => {
  if (!handle) {
    const config = loadConfig();

    handle = createApp({
      config,
      deployContext: context.deploy?.context,
      pool: getDatabase().pool,
      transport: smtpTransport(config)
    });
  }

  return handle(request, context);
};

// The region is set in netlify.toml
export const config = {
  path: ["/wishlists", "/wishlists/*"]
};
