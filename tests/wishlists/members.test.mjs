import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { Browser, createMember, lastMailTo, startTestApp, tokenFrom } from "./helpers.mjs";

let app;
let admin;
let samId;

before(async () => {
  app = await startTestApp();
});

after(() => app.stop());

beforeEach(async () => {
  await app.reset();
  await createMember(app, { email: "admin@example.test", name: "Léonie", role: "admin" });
  samId = await createMember(app, { email: "sam@example.test", name: "Sam" });
  admin = await new Browser(app).logIn("admin@example.test");
  await admin.get("/wishlists/admin/members/");
});

async function invite(email, displayName) {
  await admin.get("/wishlists/admin/members/");
  return admin.post("/wishlists/admin/members/invite/", { display_name: displayName, email });
}

describe("invitations", () => {
  it("email a single-use link that works for 7 days", async () => {
    const reply = await invite("Alex@Example.test", "Alex");
    const message = lastMailTo(app, "alex@example.test");
    const invitation = await app.db.one("SELECT extract(day FROM expires_at - created_at)::int AS days, token_hash FROM invitations");

    assert.equal(reply.location, "/wishlists/admin/members/");
    assert.equal(message.subject, "Léonie has invited you to share wishlists");
    assert.equal(invitation.days, 7);
    assert.ok(!message.text.includes(invitation.token_hash));

    const page = await admin.get("/wishlists/admin/members/");
    assert.match(page.text, /<title>Members - tink<\/title>/);
    assert.match(page.text, /Invitations not yet accepted[\s\S]*<h3>Alex<\/h3>/);
  });

  it("are accepted by confirming a display name, which logs the invitee in", async () => {
    await invite("alex@example.test", "Alex");
    const token = tokenFrom(lastMailTo(app, "alex@example.test"));
    const invitee = new Browser(app);

    // A prefetch doesn't use it up
    await new Browser(app).get(`/wishlists/invite/?token=${token}`);

    const page = await invitee.get(`/wishlists/invite/?token=${token}`);
    assert.match(page.text, /value="Alex"/);

    const reply = await invitee.post("/wishlists/invite/", { display_name: "  Alex   Jones ", token });
    assert.equal(reply.location, "/wishlists/");

    const member = await app.db.one("SELECT display_name, role, status FROM members WHERE email = 'alex@example.test'");
    assert.deepEqual(member, { display_name: "Alex Jones", role: "member", status: "active" });
    assert.match((await invitee.get("/wishlists/")).text, /Welcome to wishlists, Alex Jones/);
  });

  it("keep the token and the entered name when the name is missing", async () => {
    await invite("alex@example.test", "Alex");
    const token = tokenFrom(lastMailTo(app, "alex@example.test"));
    const reply = await new Browser(app).post("/wishlists/invite/", { display_name: "", token });

    assert.equal(reply.status, 400);
    assert.match(reply.text, /<a href="#display_name">Enter a display name<\/a>/);
    assert.ok(reply.text.includes(`name="token" value="${token}"`));
    assert.equal((await app.db.query("SELECT id FROM members WHERE email = 'alex@example.test'")).length, 0);
  });

  it("work once", async () => {
    await invite("alex@example.test", "Alex");
    const token = tokenFrom(lastMailTo(app, "alex@example.test"));

    await new Browser(app).post("/wishlists/invite/", { display_name: "Alex", token });
    const again = await new Browser(app).post("/wishlists/invite/", { display_name: "Alex", token });

    assert.equal(again.status, 400);
    assert.match(again.text, /That invitation doesn't work/);
    assert.ok(!again.text.includes("alex@example.test"));
  });

  it("expire after 7 days, and can be resent", async () => {
    await invite("alex@example.test", "Alex");
    const oldToken = tokenFrom(lastMailTo(app, "alex@example.test"));
    await app.db.query("UPDATE invitations SET expires_at = now() - interval '1 second'");

    assert.match((await new Browser(app).get(`/wishlists/invite/?token=${oldToken}`)).text, /That invitation doesn't work/);

    const page = await admin.get("/wishlists/admin/members/");
    assert.match(page.text, /Expired on/);
    assert.match(page.text, /Resend<span data-visibility="hidden"> invitation to Alex<\/span>/);

    const invitation = await app.db.one("SELECT id FROM invitations");
    await admin.post(`/wishlists/admin/invitations/${invitation.id}/resend/`);
    const newToken = tokenFrom(lastMailTo(app, "alex@example.test"));

    assert.notEqual(newToken, oldToken);
    assert.equal((await new Browser(app).get(`/wishlists/invite/?token=${oldToken}`)).text.includes("That invitation doesn't work"), true);
    assert.equal((await new Browser(app).post("/wishlists/invite/", { display_name: "Alex", token: newToken })).location, "/wishlists/");
  });

  it("can be revoked", async () => {
    await invite("alex@example.test", "Alex");
    const token = tokenFrom(lastMailTo(app, "alex@example.test"));
    const invitation = await app.db.one("SELECT id FROM invitations");

    await admin.get("/wishlists/admin/members/");
    await admin.post(`/wishlists/admin/invitations/${invitation.id}/revoke/`);

    assert.equal((await new Browser(app).post("/wishlists/invite/", { display_name: "Alex", token })).status, 400);
  });

  it("can't be sent to an existing member's address", async () => {
    const reply = await invite("SAM@example.test", "Sam again");

    assert.equal(reply.status, 400);
    assert.match(reply.text, /That email address already belongs to Sam/);
    assert.match(reply.text, /value="sam@example.test"/);
    assert.match(reply.text, /value="Sam again"/);
    assert.equal(app.mail.filter((message) => message.to === "sam@example.test").length, 0);
  });

  it("replace an earlier open invitation to the same address", async () => {
    await invite("alex@example.test", "Alex");
    await invite("alex@example.test", "Alexandra");

    assert.deepEqual(await app.db.query("SELECT display_name FROM invitations"), [{ display_name: "Alexandra" }]);
  });

  it("are recorded in the audit log", async () => {
    await invite("alex@example.test", "Alex");
    const entry = await app.db.one("SELECT action, detail FROM audit_log");

    assert.equal(entry.action, "invite");
    assert.equal(entry.detail.sent, true);
  });
});

describe("managing members", () => {
  it("suspending logs the member out everywhere and stops them logging in", async () => {
    const sam = await new Browser(app).logIn("sam@example.test");
    await admin.get("/wishlists/admin/members/");
    await admin.post(`/wishlists/admin/members/${samId}/suspend/`);

    assert.equal((await sam.get("/wishlists/")).location, "/wishlists/log-in/");
    const before = app.mail.length;
    await new Browser(app).post("/wishlists/log-in/", { email: "sam@example.test" });
    assert.equal(app.mail.length, before);

    await admin.get("/wishlists/admin/members/");
    await admin.post(`/wishlists/admin/members/${samId}/reinstate/`);
    await new Browser(app).logIn("sam@example.test");
  });

  it("the admin can't be suspended or removed", async () => {
    const adminId = (await app.db.one("SELECT id FROM members WHERE role = 'admin'")).id;

    assert.equal((await admin.post(`/wishlists/admin/members/${adminId}/suspend/`)).status, 404);
    await admin.get("/wishlists/admin/members/");
    assert.equal((await admin.post(`/wishlists/admin/members/${adminId}/remove/`)).status, 404);
    assert.equal((await admin.get(`/wishlists/admin/members/${adminId}/remove/`)).status, 404);
    assert.equal((await app.db.one("SELECT status FROM members WHERE id = $1", [adminId])).status, "active");
  });

  it("removal asks for confirmation, then deletes the member and their sessions", async () => {
    const sam = await new Browser(app).logIn("sam@example.test");
    const confirm = await admin.get(`/wishlists/admin/members/${samId}/remove/`);

    assert.match(confirm.text, /<h1>Remove Sam\?<\/h1>/);
    assert.match(confirm.text, /<button type="submit" class="btn">Remove Sam<\/button>/);

    const reply = await admin.post(`/wishlists/admin/members/${samId}/remove/`);
    assert.equal(reply.location, "/wishlists/admin/members/");
    assert.equal((await app.db.query("SELECT id FROM members WHERE id = $1", [samId])).length, 0);
    assert.equal((await app.db.query("SELECT id FROM sessions WHERE member_id = $1", [samId])).length, 0);
    assert.equal((await sam.get("/wishlists/")).location, "/wishlists/log-in/");

    const entry = await app.db.one("SELECT action, target_member_id, detail FROM audit_log WHERE action = 'remove'");
    assert.equal(entry.target_member_id, samId);
  });

  it("the admin can change a member's name and email address, keeping the address unique", async () => {
    await admin.get(`/wishlists/admin/members/${samId}/`);
    const clash = await admin.post(`/wishlists/admin/members/${samId}/`, { display_name: "Sam", email: "admin@example.test" });

    assert.equal(clash.status, 400);
    assert.match(clash.text, /That email address already belongs to Léonie/);

    await admin.get(`/wishlists/admin/members/${samId}/`);
    await admin.post(`/wishlists/admin/members/${samId}/`, { display_name: "Samantha", email: "samantha@example.test" });
    assert.deepEqual(
      await app.db.one("SELECT display_name, email FROM members WHERE id = $1", [samId]),
      { display_name: "Samantha", email: "samantha@example.test" }
    );
  });

  it("the admin can log a member out everywhere", async () => {
    const sam = await new Browser(app).logIn("sam@example.test");
    await admin.get("/wishlists/admin/members/");
    await admin.post(`/wishlists/admin/members/${samId}/log-out/`);

    assert.equal((await sam.get("/wishlists/")).location, "/wishlists/log-in/");
    assert.equal((await app.db.one("SELECT status FROM members WHERE id = $1", [samId])).status, "active");
  });

  it("buttons on the Members page say who they act on", async () => {
    await new Browser(app).logIn("sam@example.test");
    const page = await admin.get("/wishlists/admin/members/");

    assert.match(page.text, /Suspend<span data-visibility="hidden"> Sam<\/span>/);
    assert.match(page.text, /Remove<span data-visibility="hidden"> Sam<\/span>/);
    assert.match(page.text, /Edit<span data-visibility="hidden"> Sam<\/span>/);
  });
});

describe("members' own accounts", () => {
  it("a member can change their display name", async () => {
    const sam = await new Browser(app).logIn("sam@example.test");
    await sam.get("/wishlists/account/");
    const reply = await sam.post("/wishlists/account/", { display_name: "Sammy" });

    assert.equal(reply.location, "/wishlists/account/");
    assert.match((await sam.get("/wishlists/account/")).text, /<title>Account - tink<\/title>/);
  });

  it("a member can delete their own account, and the admin can't", async () => {
    const sam = await new Browser(app).logIn("sam@example.test");
    await sam.get("/wishlists/account/delete/");
    const reply = await sam.post("/wishlists/account/delete/");

    assert.equal(reply.location, "/wishlists/log-in/?status=account-deleted");
    assert.equal((await app.db.query("SELECT id FROM members WHERE id = $1", [samId])).length, 0);

    assert.equal((await admin.get("/wishlists/account/delete/")).status, 404);
  });

  it("member text is escaped, never rendered as HTML", async () => {
    const sam = await new Browser(app).logIn("sam@example.test");
    await sam.get("/wishlists/account/");
    await sam.post("/wishlists/account/", { display_name: "<script>alert(1)</script>" });
    const page = await admin.get("/wishlists/admin/members/");

    assert.ok(!page.text.includes("<script>alert(1)</script>"));
    assert.ok(page.text.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  });
});
