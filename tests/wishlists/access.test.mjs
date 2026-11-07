import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { Browser, createMember, SAFARI_IPHONE, startTestApp } from "./helpers.mjs";

let app;

before(async () => {
  app = await startTestApp();
});

after(() => app.stop());

beforeEach(async () => {
  await app.reset();
  await createMember(app, { email: "admin@example.test", name: "Léonie", role: "admin" });
  await createMember(app, { email: "sam@example.test", name: "Sam" });
});

describe("logged-out access", () => {
  const protectedPaths = ["/wishlists/", "/wishlists/account/", "/wishlists/admin/members/", "/wishlists/mine/"];

  for (const path of protectedPaths) {
    it(`redirects ${path} to log-in and shows no data`, async () => {
      const reply = await new Browser(app).get(path);

      assert.equal(reply.status, 303);
      assert.equal(reply.location, "/wishlists/log-in/");
      assert.equal(reply.text, "");
    });
  }

  it("lets anyone see the log-in, invitation and help pages, with no navigation", async () => {
    for (const path of ["/wishlists/log-in/", "/wishlists/invite/", "/wishlists/help/"]) {
      const reply = await new Browser(app).get(path);

      assert.equal(reply.status, 200, path);
      assert.ok(!reply.text.includes("<nav"), path);
    }
  });

  it("refuses POSTs to member pages without a session", async () => {
    const reply = await new Browser(app).post("/wishlists/admin/members/invite/", { display_name: "Eve", email: "eve@example.test" });

    assert.equal(reply.location, "/wishlists/log-in/");
    assert.equal(app.mail.length, 0);
  });
});

describe("response headers", () => {
  it("match the Security section on every response", async () => {
    const browser = new Browser(app);

    for (const reply of [await browser.get("/wishlists/log-in/"), await browser.get("/wishlists/"), await browser.get("/wishlists/nope/")]) {
      assert.equal(reply.headers.get("cache-control"), "no-store");
      assert.equal(reply.headers.get("x-robots-tag"), "noindex, nofollow");
      assert.equal(reply.headers.get("content-security-policy"), "default-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'; object-src 'none'");
      assert.equal(reply.headers.get("referrer-policy"), "no-referrer");
      assert.equal(reply.headers.get("x-content-type-options"), "nosniff");
    }
  });

  it("include Clear-Site-Data on log-out only", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");

    assert.equal((await browser.get("/wishlists/account/")).headers.get("clear-site-data"), null);
    const reply = await browser.post("/wishlists/log-out/");
    assert.equal(reply.headers.get("clear-site-data"), "\"cache\", \"cookies\", \"storage\"");
  });

  it("render pages with noindex and without the site search", async () => {
    const page = await new Browser(app).get("/wishlists/log-in/");

    assert.match(page.text, /<meta name="robots" content="noindex, nofollow" \/>/);
    assert.ok(!page.text.includes("pagefind"));
  });
});

describe("navigation", () => {
  it("shows the wishlists navigation, with Members for the admin only", async () => {
    const member = await new Browser(app).logIn("sam@example.test");
    const admin = await new Browser(app).logIn("admin@example.test");
    const memberPage = await member.get("/wishlists/account/");
    const adminPage = await admin.get("/wishlists/account/");

    assert.match(memberPage.text, /<nav data-navigation-body="bar" aria-label="Wishlists">/);
    assert.ok(!memberPage.text.includes('aria-label="Website"'));
    assert.match(memberPage.text, /<a href="\/wishlists\/account\/"\s+aria-current="page"/);
    assert.ok(!memberPage.text.includes("/wishlists/admin/members/"));
    assert.ok(adminPage.text.includes('<a href="/wishlists/admin/members/"'));
    assert.match(memberPage.text, /<form method="post" action="\/wishlists\/log-out\/"><input type="hidden" name="_csrf" value="[0-9a-f]{64}"><button type="submit">Log out<\/button><\/form>/);
  });
});

describe("request checks", () => {
  it("rejects a POST without the CSRF token", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    const reply = await browser.request("POST", "/wishlists/account/", { form: { display_name: "Hacked" } });

    assert.equal(reply.status, 403);
    assert.equal((await app.db.one("SELECT display_name FROM members WHERE email = 'sam@example.test'")).display_name, "Sam");
  });

  it("rejects another session's CSRF token", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    const other = await new Browser(app).logIn("sam@example.test");
    const otherToken = other.lastHtml.match(/name="_csrf" value="([^"]*)"/)[1];
    const reply = await browser.post("/wishlists/account/", { _csrf: otherToken, display_name: "Hacked" });

    assert.equal(reply.status, 403);
  });

  it("rejects a cross-site POST, even with a valid CSRF token", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    await browser.get("/wishlists/account/");
    const reply = await browser.post("/wishlists/account/", { display_name: "Hacked" }, { headers: { "sec-fetch-site": "cross-site" } });

    assert.equal(reply.status, 403);
  });

  it("rejects another Origin from browsers without Sec-Fetch-Site", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    await browser.get("/wishlists/account/");
    const reply = await browser.post("/wishlists/account/", { display_name: "Hacked" }, { headers: { origin: "https://evil.example", "sec-fetch-site": null } });

    assert.equal(reply.status, 403);
  });

  it("falls back to Origin, then Referer, for older browsers", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    const legacy = { origin: "https://tink.test", "sec-fetch-site": null };

    await browser.get("/wishlists/account/");
    assert.equal((await browser.post("/wishlists/account/", { display_name: "Sam O" }, { headers: legacy })).status, 303);

    await browser.get("/wishlists/account/");
    const crossReferer = { origin: null, referer: "https://evil.example/page", "sec-fetch-site": null };
    assert.equal((await browser.post("/wishlists/account/", { display_name: "Sam R" }, { headers: crossReferer })).status, 403);
  });

  it("still needs the CSRF token when a browser sends no origin information", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    const reply = await browser.request("POST", "/wishlists/account/", {
      form: { display_name: "Hacked" },
      headers: { origin: null, "sec-fetch-site": null }
    });

    assert.equal(reply.status, 403);
  });

  it("hides admin pages from members", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");

    assert.equal((await browser.get("/wishlists/admin/members/")).status, 404);
    assert.equal((await browser.post("/wishlists/admin/members/invite/", { display_name: "Eve", email: "eve@example.test" })).status, 404);
    assert.equal(app.mail.filter((message) => message.to === "eve@example.test").length, 0);
  });

  it("treats a malformed ID as not found", async () => {
    const admin = await new Browser(app).logIn("admin@example.test");

    assert.equal((await admin.get("/wishlists/admin/members/not-a-uuid/")).status, 404);
    assert.equal((await admin.get("/wishlists/admin/members/00000000-0000-4000-8000-000000000000/")).status, 404);
  });
});

describe("sessions", () => {
  it("set a __Host- cookie that lasts 400 days", async () => {
    const browser = new Browser(app);
    await browser.post("/wishlists/log-in/", { email: "sam@example.test" });
    const token = app.mail.at(-1).text.match(/token=([A-Za-z0-9_-]+)/)[1];
    const reply = await browser.post("/wishlists/log-in/link/", { token });
    const cookie = reply.setCookies.find((value) => value.startsWith("__Host-wishlists_session="));

    assert.match(cookie, /^__Host-wishlists_session=[A-Za-z0-9_-]{43}; Max-Age=34560000; Path=\/; Secure; HttpOnly; SameSite=Lax$/);
    assert.ok(!/Domain=/i.test(cookie));
  });

  it("store only a hash of the session token", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    const token = browser.cookies.get("__Host-wishlists_session");
    const stored = JSON.stringify(await app.db.query("SELECT * FROM sessions"));

    assert.ok(!stored.includes(token));
  });

  it("slide the expiry forward at most once a day", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");

    assert.ok(!(await browser.get("/wishlists/")).setCookies.some((cookie) => cookie.startsWith("__Host-wishlists_session=")));

    await app.db.query("UPDATE sessions SET last_used_at = now() - interval '2 days', expires_at = now() + interval '398 days'");
    const reply = await browser.get("/wishlists/");
    const session = await app.db.one("SELECT extract(day FROM expires_at - now())::int AS days_left FROM sessions");

    assert.ok(reply.setCookies.some((cookie) => cookie.startsWith("__Host-wishlists_session=") && cookie.includes("Max-Age=34560000")));
    assert.equal(session.days_left, 399);
  });

  it("stop working once expired", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    await app.db.query("UPDATE sessions SET expires_at = now() - interval '1 second'");

    assert.equal((await browser.get("/wishlists/")).location, "/wishlists/log-in/");
  });

  it("are listed on the Account page with the device, and can be logged out one at a time", async () => {
    const laptop = await new Browser(app).logIn("sam@example.test");
    const phone = await new Browser(app, { userAgent: SAFARI_IPHONE }).logIn("sam@example.test");
    const page = await laptop.get("/wishlists/account/");

    assert.match(page.text, /<h3>Chrome on Windows \(this browser\)<\/h3>/);
    assert.match(page.text, /<h3>Safari on iPhone<\/h3>/);

    const phoneSession = await app.db.one("SELECT id FROM sessions WHERE user_agent_summary = 'Safari on iPhone'");
    const reply = await laptop.post(`/wishlists/account/sessions/${phoneSession.id}/log-out/`);

    assert.equal(reply.location, "/wishlists/account/");
    assert.equal((await phone.get("/wishlists/")).location, "/wishlists/log-in/");
    assert.equal((await laptop.get("/wishlists/")).status, 200);
  });

  it("can't be logged out by another member", async () => {
    await new Browser(app).logIn("admin@example.test");
    const sam = await new Browser(app).logIn("sam@example.test");
    const adminSession = await app.db.one("SELECT s.id FROM sessions s JOIN members m ON m.id = s.member_id WHERE m.role = 'admin'");
    await sam.get("/wishlists/account/");

    assert.equal((await sam.post(`/wishlists/account/sessions/${adminSession.id}/log-out/`)).status, 404);
    assert.equal((await app.db.query("SELECT id FROM sessions WHERE id = $1", [adminSession.id])).length, 1);
  });

  it("all end with Log out everywhere", async () => {
    const laptop = await new Browser(app).logIn("sam@example.test");
    const phone = await new Browser(app).logIn("sam@example.test");
    await laptop.get("/wishlists/account/");
    const reply = await laptop.post("/wishlists/account/log-out-everywhere/");

    assert.equal(reply.location, "/wishlists/log-in/?status=logged-out");
    assert.equal((await phone.get("/wishlists/")).location, "/wishlists/log-in/");
    assert.equal((await laptop.get("/wishlists/")).location, "/wishlists/log-in/");
  });

  it("end with log-out, which shows a confirmation", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    const reply = await browser.post("/wishlists/log-out/");
    const page = await browser.get(reply.location);

    assert.match(page.text, /<title>Log in - tink<\/title>/);
    assert.match(page.text, /<div class="wishlists-status" tabindex="-1" autofocus>/);
    assert.equal((await app.db.query("SELECT id FROM sessions")).length, 0);
  });

  it("stop working when the member is suspended", async () => {
    const browser = await new Browser(app).logIn("sam@example.test");
    await app.db.query("UPDATE members SET status = 'suspended' WHERE email = 'sam@example.test'");

    assert.equal((await browser.get("/wishlists/")).location, "/wishlists/log-in/");
  });
});
