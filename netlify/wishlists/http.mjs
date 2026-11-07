// Response headers for everything under /wishlists/. Netlify doesn't apply netlify.toml
// header rules to function responses, so the function sends them itself.
export const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'; object-src 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow"
};

export const MAX_BODY_BYTES = 64 * 1024;

export function parseCookies(header) {
  const cookies = {};

  for (const part of String(header || "").split(";")) {
    const index = part.indexOf("=");

    if (index > 0) {
      const name = part.slice(0, index).trim();

      if (!(name in cookies)) {
        cookies[name] = part.slice(index + 1).trim();
      }
    }
  }

  return cookies;
}

// Every cookie the app sets uses the __Host- prefix: Secure, Path=/ and no Domain
export function serializeCookie(name, value, maxAgeSeconds) {
  return `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; Secure; HttpOnly; SameSite=Lax`;
}

export function html(body, status = 200) {
  return { body, headers: { "Content-Type": "text/html; charset=utf-8" }, status };
}

// 303 so the browser follows a POST with a GET
export function redirect(location, status = 303) {
  return { body: null, headers: { Location: location }, status };
}

export function toResponse(result, { cookies = [], extraHeaders = {}, method = "GET" } = {}) {
  const headers = new Headers({ ...SECURITY_HEADERS, ...result.headers, ...extraHeaders });

  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(method === "HEAD" ? null : result.body, { headers, status: result.status });
}

// Same-origin check for POSTs. Referrer-Policy: no-referrer makes browsers send
// "Origin: null" on form posts, so Sec-Fetch-Site comes first. Older browsers that send
// none of these still face the CSRF token, and the log-in and invitation token checks.
export function isSameOrigin(request, ownOrigin) {
  const site = request.headers.get("sec-fetch-site");

  if (site) {
    return site === "same-origin";
  }

  const origin = request.headers.get("origin");

  if (origin && origin !== "null") {
    return origin === ownOrigin;
  }

  const referer = request.headers.get("referer");

  if (referer) {
    try {
      return new URL(referer).origin === ownOrigin;
    } catch {
      return false;
    }
  }

  return true;
}
