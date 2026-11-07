// First-time set-up: the admin is created from the WISHLISTS_ADMIN_EMAIL setting on the first
// log-in request for that address, but only while there's no admin.
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { Browser, createMember, lastMailTo, startTestApp } from "./helpers.mjs";

let app;

before(async () => {
  // As on a deploy preview, where email only goes to the admin
  app = await startTestApp({
    config: { adminEmail: "leonie@example.test", adminName: "Léonie" },
    deployContext: "deploy-preview"
  });
});

after(() => app.stop());

beforeEach(() => app.reset());

const admins = () => app.db.query("SELECT email, display_name, role, status FROM members WHERE role = 'admin'");

describe("first-time admin set-up", () => {
  it("creates the admin from the setting on their first log-in request, and emails them", async () => {
    const browser = new Browser(app);
    const reply = await browser.post("/wishlists/log-in/", { email: " Leonie@Example.test " });

    assert.equal(reply.location, "/wishlists/log-in/code/");
    assert.deepEqual(await admins(), [{ display_name: "Léonie", email: "leonie@example.test", role: "admin", status: "active" }]);
    assert.ok(lastMailTo(app, "leonie@example.test"));

    await browser.logIn("leonie@example.test");
    assert.equal((await browser.get("/wishlists/admin/members/")).status, 200);
  });

  it("does nothing for any other address", async () => {
    await new Browser(app).post("/wishlists/log-in/", { email: "someone@example.test" });

    assert.deepEqual(await app.db.query("SELECT id FROM members"), []);
    assert.equal(app.mail.length, 0);
  });

  it("does nothing once there's an admin, even for the address in the setting", async () => {
    await createMember(app, { email: "first@example.test", name: "First", role: "admin" });
    await createMember(app, { email: "leonie@example.test", name: "Léonie", role: "member" });
    await new Browser(app).post("/wishlists/log-in/", { email: "leonie@example.test" });

    assert.deepEqual((await admins()).map((admin) => admin.email), ["first@example.test"]);
    assert.equal((await app.db.one("SELECT role FROM members WHERE email = 'leonie@example.test'")).role, "member");
  });

  it("makes an existing member with that address the admin, while there's no admin", async () => {
    await createMember(app, { email: "leonie@example.test", name: "Léonie W", status: "suspended" });
    await new Browser(app).post("/wishlists/log-in/", { email: "leonie@example.test" });

    assert.deepEqual(await admins(), [{ display_name: "Léonie W", email: "leonie@example.test", role: "admin", status: "active" }]);
  });

  it("creates only one admin when two requests arrive together", async () => {
    await Promise.all([
      new Browser(app).post("/wishlists/log-in/", { email: "leonie@example.test" }),
      new Browser(app).post("/wishlists/log-in/", { email: "leonie@example.test" })
    ]);

    assert.equal((await admins()).length, 1);
  });
});

describe("without the setting", () => {
  let plain;

  before(async () => {
    plain = await startTestApp({ deployContext: "deploy-preview" });
  });

  after(() => plain.stop());

  it("never creates an admin", async () => {
    await new Browser(plain).post("/wishlists/log-in/", { email: "leonie@example.test" });

    assert.deepEqual(await plain.db.query("SELECT id FROM members"), []);
    assert.equal(plain.mail.length, 0);
  });
});
