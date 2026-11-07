import { createApp } from "../../netlify/wishlists/app.mjs";
import { createDb } from "../../netlify/wishlists/db.mjs";
import { startLocalDatabase } from "../../scripts/wishlists-local-db.mjs";

export const ORIGIN = "https://tink.test";
export const CHROME_WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";
export const SAFARI_IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1";

const TABLES = ["reservations", "items", "lists", "audit_log", "rate_limit_events", "sessions", "login_tokens", "invitations", "members"];

// One database per test file. Call reset() before each test. config adds to or overrides the
// app's settings, and deployContext stands in for Netlify's ("production", "deploy-preview").
export async function startTestApp({ config = {}, deployContext = "production" } = {}) {
  const database = await startLocalDatabase();
  const mail = [];
  const app = {
    db: createDb(database.pool),
    handle: createApp({
      config: { baseUrl: ORIGIN, emailFrom: "\"tink wishlists\" <wishlists@tink.test>", ...config },
      deployContext,
      pool: database.pool,
      transport: async (message) => {
        mail.push(message);
      }
    }),
    mail,
    async reset() {
      mail.length = 0;
      await database.pool.query(`TRUNCATE ${TABLES.join(", ")} CASCADE`);
    },
    stop: () => database.stop()
  };

  return app;
}

export async function createMember(app, { email, name, role = "member", status = "active" }) {
  const row = await app.db.one(
    "INSERT INTO members (email, display_name, role, status) VALUES ($1, $2, $3, $4) RETURNING id",
    [email, name, role, status]
  );

  return row.id;
}

export function lastMailTo(app, address) {
  return [...app.mail].reverse().find((message) => message.to === address);
}

export function tokenFrom(message) {
  return message.text.match(/token=([A-Za-z0-9_-]+)/)[1];
}

export function codeFrom(message) {
  return message.subject.match(/(\d{6})$/)[1];
}

let browserCount = 0;

// A browser with its own cookie jar and IP address. post() adds the Origin header and,
// when the last page had one, the CSRF token, as a real form submission would.
export class Browser {
  constructor(app, { ip, userAgent = CHROME_WINDOWS } = {}) {
    browserCount += 1;
    this.app = app;
    this.cookies = new Map();
    this.ip = ip || `192.0.2.${browserCount % 250}`;
    this.rawCookies = [];
    this.lastHtml = "";
    this.userAgent = userAgent;
  }

  async request(method, path, { form, headers = {} } = {}) {
    const requestHeaders = new Headers({ "user-agent": this.userAgent, "x-nf-client-connection-ip": this.ip });
    let body;

    if (this.cookies.size) {
      requestHeaders.set("cookie", [...this.cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    }

    // What browsers send on a same-origin form post. Referrer-Policy: no-referrer makes
    // the Origin "null", which is why the app checks Sec-Fetch-Site first.
    if (form) {
      body = new URLSearchParams(form).toString();
      requestHeaders.set("content-type", "application/x-www-form-urlencoded");
      requestHeaders.set("origin", "null");
      requestHeaders.set("sec-fetch-site", "same-origin");
    }

    for (const [name, value] of Object.entries(headers)) {
      if (value === null) {
        requestHeaders.delete(name);
      } else {
        requestHeaders.set(name, value);
      }
    }

    const response = await this.app.handle(new Request(`${ORIGIN}${path}`, { body, headers: requestHeaders, method }));
    const setCookies = response.headers.getSetCookie();
    this.rawCookies = setCookies;

    for (const cookie of setCookies) {
      const [pair] = cookie.split(";");
      const index = pair.indexOf("=");
      const name = pair.slice(0, index);

      if (/Max-Age=0(;|$)/.test(cookie)) {
        this.cookies.delete(name);
      } else {
        this.cookies.set(name, pair.slice(index + 1));
      }
    }

    const text = await response.text();

    if (text) {
      this.lastHtml = text;
    }

    return { headers: response.headers, location: response.headers.get("location"), setCookies, status: response.status, text };
  }

  get(path, options) {
    return this.request("GET", path, options);
  }

  post(path, form = {}, options) {
    const csrf = this.lastHtml.match(/name="_csrf" value="([^"]*)"/);
    return this.request("POST", path, { ...options, form: csrf && !("_csrf" in form) ? { _csrf: csrf[1], ...form } : form });
  }

  // Logs in through the real email link flow
  async logIn(email) {
    await this.post("/wishlists/log-in/", { email });
    const token = tokenFrom(lastMailTo(this.app, email));
    const response = await this.post("/wishlists/log-in/link/", { token });

    if (response.location !== "/wishlists/") {
      throw new Error(`Log-in failed for ${email}: ${response.status}`);
    }

    await this.get("/wishlists/");
    return this;
  }
}

// Creates a list through the app, as its owner would. Returns its ID.
export async function createList(browser, fields) {
  await browser.get("/wishlists/mine/new/");
  const reply = await browser.post("/wishlists/mine/new/", { description: "", occasion_date: "", ...fields });

  if (reply.status !== 303) {
    throw new Error(`Couldn't create list ${fields.title}: ${reply.status}`);
  }

  return reply.location.match(/lists\/([0-9a-f-]{36})\//)[1];
}

// Adds an item through the app. Returns its ID.
export async function addItem(browser, listId, fields) {
  await browser.get(`/wishlists/lists/${listId}/items/new/`);
  const reply = await browser.post(`/wishlists/lists/${listId}/items/new/`, { price: "", quantity: "", url: "", ...fields });

  if (reply.status !== 303) {
    throw new Error(`Couldn't add item ${fields.name}: ${reply.status}`);
  }

  const row = await browser.app.db.one(
    "SELECT id FROM items WHERE list_id = $1 AND name = $2 ORDER BY created_at DESC LIMIT 1",
    [listId, fields.name]
  );

  return row.id;
}

// Reserves through the app, from the list page, as a member would
export async function reserveItem(browser, listId, itemId, quantity = 1) {
  await browser.get(`/wishlists/lists/${listId}/`);
  return browser.post(`/wishlists/lists/${listId}/items/${itemId}/reserve/`, { quantity: String(quantity), return_to: "list" });
}

// The part of a page inside <main>
export function mainOf(html) {
  return html.slice(html.indexOf("<main"), html.indexOf("</main>"));
}
