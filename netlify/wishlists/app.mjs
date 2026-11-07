import { createDb } from "./db.mjs";
import { html, isSameOrigin, MAX_BODY_BYTES, parseCookies, redirect, serializeCookie, toResponse } from "./http.mjs";
import { allow, bucket, LIMITS } from "./rate-limit.mjs";
import { renderPage } from "./render.mjs";
import { notFound } from "./routes/common.mjs";
import { routes } from "./routes/index.mjs";
import { safeEqual } from "./security.mjs";
import { loadSession } from "./sessions.mjs";

const FLASH_COOKIE = "__Host-wishlists_flash";

// pool: a pg pool. transport: sends one email. deployContext: Netlify's deploy context.
export function createApp({ config, deployContext, pool, transport }) {
  const app = { config, db: createDb(pool), deployContext, transport };

  return async function handle(request, netlifyContext = {}) {
    const url = new URL(request.url);
    const ctx = createContext(app, request, url, netlifyContext);

    try {
      const result = await route(ctx);
      await Promise.all(ctx.pending);
      return toResponse(result, { cookies: ctx.cookiesOut, extraHeaders: ctx.extraHeaders, method: request.method });
    } catch (error) {
      console.error("Wishlists request failed:", error);
      ctx.flash = null;
      return toResponse(html(renderPage(ctx, "error.html", { title: "Something went wrong" }), 500), { method: request.method });
    }
  };
}

function createContext(app, request, url, netlifyContext) {
  const ctx = {
    app,
    baseUrl: app.config.baseUrl || url.origin,
    cookies: parseCookies(request.headers.get("cookie")),
    cookiesOut: [],
    csrfToken: null,
    db: app.db,
    extraHeaders: {},
    flash: null,
    form: null,
    ip: netlifyContext.ip || request.headers.get("x-nf-client-connection-ip") || "unknown",
    member: null,
    method: request.method,
    path: url.pathname,
    pending: [],
    query: url.searchParams,
    request,
    session: null,
    url,
    setCookie(name, value, maxAge) {
      ctx.cookiesOut.push(serializeCookie(name, value, maxAge));
    },
    clearCookie(name) {
      ctx.cookiesOut.push(serializeCookie(name, "", 0));
    },
    // A confirmation shown, and focused, at the top of the next page
    setFlash(message) {
      ctx.setCookie(FLASH_COOKIE, Buffer.from(JSON.stringify({ message })).toString("base64url"), 60);
    },
    // Work that can finish after the response, such as sending a log-in email,
    // so response times don't show whether an address belongs to a member
    background(promise) {
      const guarded = promise.catch((error) => console.error("Wishlists background task failed:", error.message));

      if (netlifyContext.waitUntil) {
        netlifyContext.waitUntil(guarded);
      } else {
        ctx.pending.push(guarded);
      }
    }
  };

  return ctx;
}

async function route(ctx) {
  const { method, path } = ctx;

  if (path === "/wishlists") {
    return redirect(`/wishlists/${ctx.url.search}`, 301);
  }

  if (!["GET", "HEAD", "POST"].includes(method)) {
    return html(renderPage(ctx, "error.html", { title: "Method not allowed" }), 405);
  }

  if (method !== "POST" && !path.endsWith("/")) {
    return redirect(`${path}/${ctx.url.search}`, 301);
  }

  if (method === "POST") {
    const problem = await readForm(ctx);

    if (problem) {
      return problem;
    }
  }

  await loadSession(ctx);
  readFlash(ctx);

  const match = findRoute(method === "HEAD" ? "GET" : method, path);

  // Logged-out visitors learn nothing about which pages exist
  if (!match) {
    return ctx.member ? notFound(ctx) : redirect("/wishlists/log-in/");
  }

  const { handler, params, access } = match;

  if (access !== "public" && !ctx.member) {
    return redirect("/wishlists/log-in/");
  }

  // Admin pages don't exist as far as other members can tell
  if (access === "admin" && ctx.member.role !== "admin") {
    return notFound(ctx);
  }

  if (method === "POST" && access !== "public") {
    if (!safeEqual(ctx.form.get("_csrf") || "", ctx.csrfToken)) {
      return forbidden(ctx);
    }

    if (!(await allow(ctx.db, bucket("session-posts", ctx.session.id), LIMITS.sessionPosts))) {
      return html(renderPage(ctx, "error.html", {
        message: "You've made a lot of changes in a short time. Wait a few minutes, then try again.",
        title: "Too many requests"
      }), 429);
    }
  }

  return handler(ctx, params);
}

async function readForm(ctx) {
  if (!isSameOrigin(ctx.request, ctx.url.origin)) {
    return forbidden(ctx);
  }

  const length = Number(ctx.request.headers.get("content-length") || 0);
  const type = ctx.request.headers.get("content-type") || "";

  if (length > MAX_BODY_BYTES) {
    return html(renderPage(ctx, "error.html", { title: "That form was too large" }), 413);
  }

  if (!type.startsWith("application/x-www-form-urlencoded")) {
    return html(renderPage(ctx, "error.html", { title: "That form couldn't be read" }), 415);
  }

  const body = await ctx.request.text();

  if (body.length > MAX_BODY_BYTES) {
    return html(renderPage(ctx, "error.html", { title: "That form was too large" }), 413);
  }

  ctx.form = new URLSearchParams(body);
  return null;
}

function readFlash(ctx) {
  const value = ctx.cookies[FLASH_COOKIE];

  if (!value || ctx.method !== "GET") {
    return;
  }

  ctx.clearCookie(FLASH_COOKIE);

  try {
    const flash = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

    if (typeof flash.message === "string") {
      ctx.flash = flash;
    }
  } catch {
    // Ignore a damaged flash cookie
  }
}

function findRoute(method, path) {
  for (const entry of routes) {
    if (entry.method !== method) {
      continue;
    }

    const found = entry.pattern.exec(path);

    if (found) {
      return { access: entry.access, handler: entry.handler, params: found.groups || {} };
    }
  }

  return null;
}

function forbidden(ctx) {
  return html(renderPage(ctx, "error.html", {
    message: "Your request couldn't be checked, so nothing was changed. Go back, reload the page and try again.",
    title: "Request not accepted"
  }), 403);
}
