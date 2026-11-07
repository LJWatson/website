import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { Browser, codeFrom, createMember, lastMailTo, startTestApp, tokenFrom } from "./helpers.mjs";

let app;

before(async () => {
  app = await startTestApp();
});

after(() => app.stop());

beforeEach(async () => {
  await app.reset();
  await createMember(app, { email: "sam@example.test", name: "Sam" });
});

describe("requesting a log-in email", () => {
  it("replies the same way whether or not the address belongs to a member", async () => {
    const member = new Browser(app);
    const stranger = new Browser(app);
    const memberReply = await member.post("/wishlists/log-in/", { email: "sam@example.test" });
    const strangerReply = await stranger.post("/wishlists/log-in/", { email: "nobody@example.test" });

    assert.equal(memberReply.status, strangerReply.status);
    assert.equal(memberReply.location, strangerReply.location);
    assert.deepEqual(
      memberReply.setCookies.map((cookie) => cookie.replace(/=[^;]+/, "=")),
      strangerReply.setCookies.map((cookie) => cookie.replace(/=[^;]+/, "="))
    );

    const memberPage = await member.get(memberReply.location);
    const strangerPage = await stranger.get(strangerReply.location);
    assert.equal(memberPage.text, strangerPage.text);
    assert.match(memberPage.text, /If that address belongs to an account, you'll receive an email with a log-in link\. It'll work for the next 15 minutes\.<\/p>\s*<p>Alternatively, the email also contains a 6 digit code that you can enter, here:<\/p>/);

    assert.equal(app.mail.length, 1);
    assert.equal(app.mail[0].to, "sam@example.test");
  });

  it("sends the link and code in plain text with an HTML alternative", async () => {
    await new Browser(app).post("/wishlists/log-in/", { email: "Sam@Example.test " });
    const message = lastMailTo(app, "sam@example.test");
    const link = `https://tink.test/wishlists/log-in/link/?token=${tokenFrom(message)}`;
    const code = codeFrom(message);

    assert.equal(message.subject, "Log into Wishlists");
    assert.equal(message.text, [
      "Hello Sam,",
      `You can log into Wishlists, or paste this URL into your browser:\n${link}`,
      `Alternatively, you can enter this code:\n${code}`,
      "Note: if you're using Wishlists from your homescreen, you'll need to use the code.",
      "The link and the code will work for the next 15 minutes, but you can only use them once."
    ].join("\n\n"));
    assert.ok(message.html.includes(`You can <a href="${link}">log into Wishlists</a>, or paste this URL into your browser:<br>${link}`));
    assert.ok(message.html.includes(`Alternatively, you can enter this code:<br><strong>${code}</strong>`));
    assert.ok(!/<img/i.test(message.html));
  });

  it("stores only hashes of the token and code", async () => {
    await new Browser(app).post("/wishlists/log-in/", { email: "sam@example.test" });
    const message = lastMailTo(app, "sam@example.test");
    const rows = await app.db.query("SELECT * FROM login_tokens");
    const stored = JSON.stringify(rows);

    assert.equal(rows.length, 1);
    assert.ok(!stored.includes(tokenFrom(message)));
    assert.ok(!stored.includes(codeFrom(message)));
  });

  it("sends no email to suspended members", async () => {
    await createMember(app, { email: "alex@example.test", name: "Alex", status: "suspended" });
    await new Browser(app).post("/wishlists/log-in/", { email: "alex@example.test" });

    assert.equal(app.mail.length, 0);
  });

  it("shows an error for a missing or malformed address", async () => {
    const browser = new Browser(app);
    const empty = await browser.post("/wishlists/log-in/", { email: "" });

    assert.equal(empty.status, 400);
    assert.match(empty.text, /<title>Error: Log in - tink<\/title>/);
    assert.match(empty.text, /<a href="#email">Enter your email address<\/a>/);
    assert.match(empty.text, /aria-describedby="email-error" aria-invalid="true"/);

    const malformed = await browser.post("/wishlists/log-in/", { email: "sam at example" });
    assert.match(malformed.text, /value="sam at example"/);
  });

  it("allows 5 emails an hour per address, for members and non-members alike", async () => {
    for (const email of ["sam@example.test", "nobody@example.test"]) {
      const replies = [];

      for (let attempt = 0; attempt < 6; attempt += 1) {
        replies.push((await new Browser(app).post("/wishlists/log-in/", { email })).status);
      }

      assert.deepEqual(replies, [303, 303, 303, 303, 303, 429]);
    }

    assert.equal(app.mail.length, 5);
  });

  it("allows 5 emails an hour per IP address", async () => {
    const replies = [];

    for (let attempt = 0; attempt < 6; attempt += 1) {
      replies.push((await new Browser(app, { ip: "198.51.100.7" }).post("/wishlists/log-in/", { email: `person${attempt}@example.test` })).status);
    }

    assert.deepEqual(replies, [303, 303, 303, 303, 303, 429]);
  });
});

describe("the log-in link", () => {
  it("survives a prefetch: GET shows a button and doesn't use the token", async () => {
    const browser = new Browser(app);
    await browser.post("/wishlists/log-in/", { email: "sam@example.test" });
    const token = tokenFrom(lastMailTo(app, "sam@example.test"));

    const scanner = await new Browser(app).get(`/wishlists/log-in/link/?token=${token}`);
    assert.equal(scanner.status, 200);
    assert.equal(scanner.setCookies.length, 0);

    const page = await browser.get(`/wishlists/log-in/link/?token=${token}`);
    assert.match(page.text, /<button type="submit" class="btn">Log in<\/button>/);

    const loggedIn = await browser.post("/wishlists/log-in/link/", { token });
    assert.equal(loggedIn.location, "/wishlists/");

    const home = await browser.get("/wishlists/");
    assert.equal(home.status, 200);
    assert.match(home.text, /<p>You&#39;re logged in as Sam\.<\/p>/);
    assert.match(home.text, /<title>Everyone&#39;s lists - tink<\/title>/);
  });

  it("works on a different device from the one that asked", async () => {
    await new Browser(app).post("/wishlists/log-in/", { email: "sam@example.test" });
    const token = tokenFrom(lastMailTo(app, "sam@example.test"));
    const otherDevice = new Browser(app);

    assert.equal((await otherDevice.post("/wishlists/log-in/link/", { token })).location, "/wishlists/");
  });

  it("works once", async () => {
    const browser = new Browser(app);
    await browser.post("/wishlists/log-in/", { email: "sam@example.test" });
    const token = tokenFrom(lastMailTo(app, "sam@example.test"));

    await browser.post("/wishlists/log-in/link/", { token });
    const again = await new Browser(app).post("/wishlists/log-in/link/", { token });

    assert.equal(again.status, 400);
    assert.match(again.text, /That log-in link doesn't work/);
    assert.match((await new Browser(app).get(`/wishlists/log-in/link/?token=${token}`)).text, /That log-in link doesn't work/);
  });

  it("expires after 15 minutes", async () => {
    const browser = new Browser(app);
    await browser.post("/wishlists/log-in/", { email: "sam@example.test" });
    const token = tokenFrom(lastMailTo(app, "sam@example.test"));
    const expiry = await app.db.one("SELECT expires_at - created_at AS lifetime FROM login_tokens");

    assert.equal(expiry.lifetime.minutes, 15);

    await app.db.query("UPDATE login_tokens SET expires_at = now() - interval '1 second'");
    assert.equal((await browser.post("/wishlists/log-in/link/", { token })).status, 400);
  });

  it("stops the code from working", async () => {
    const browser = new Browser(app);
    await browser.post("/wishlists/log-in/", { email: "sam@example.test" });
    const message = lastMailTo(app, "sam@example.test");

    await new Browser(app).post("/wishlists/log-in/link/", { token: tokenFrom(message) });
    await browser.get("/wishlists/log-in/code/");
    const reply = await browser.post("/wishlists/log-in/code/", { code: codeFrom(message) });

    assert.equal(reply.status, 400);
    assert.match(reply.text, /That code didn&#39;t work/);
  });

  it("doesn't log in a member who has since been suspended", async () => {
    const browser = new Browser(app);
    await browser.post("/wishlists/log-in/", { email: "sam@example.test" });
    const token = tokenFrom(lastMailTo(app, "sam@example.test"));

    await app.db.query("UPDATE members SET status = 'suspended'");
    assert.equal((await browser.post("/wishlists/log-in/link/", { token })).status, 400);
  });
});

describe("the log-in code", () => {
  async function requestCode(browser = new Browser(app)) {
    await browser.post("/wishlists/log-in/", { email: "sam@example.test" });
    await browser.get("/wishlists/log-in/code/");
    return { browser, message: lastMailTo(app, "sam@example.test") };
  }

  it("has a labelled one-time-code field that allows paste", async () => {
    const { browser } = await requestCode();
    const page = await browser.get("/wishlists/log-in/code/");

    assert.match(page.text, /<label for="code">Log-in code<\/label>/);
    assert.match(page.text, /<input type="text" id="code" name="code" value="" autocomplete="one-time-code" inputmode="numeric"/);
    assert.ok(!/onpaste|maxlength/.test(page.text));
  });

  it("logs in the browser that asked, and accepts spaces", async () => {
    const { browser, message } = await requestCode();
    const code = codeFrom(message);
    const reply = await browser.post("/wishlists/log-in/code/", { code: `${code.slice(0, 3)} ${code.slice(3)}` });

    assert.equal(reply.location, "/wishlists/");
    assert.ok(!browser.cookies.has("__Host-wishlists_pending"));

    const home = await browser.get("/wishlists/");
    assert.equal(home.status, 200);
    assert.match(home.text, /<p>You&#39;re logged in as Sam\.<\/p>/);
  });

  it("only works in the browser holding the pending log-in cookie", async () => {
    const { message } = await requestCode();
    const elsewhere = new Browser(app);

    const noCookie = await elsewhere.post("/wishlists/log-in/code/", { code: codeFrom(message) });
    assert.equal(noCookie.location, "/wishlists/log-in/");

    await elsewhere.post("/wishlists/log-in/", { email: "nobody@example.test" });
    const otherCookie = await elsewhere.post("/wishlists/log-in/code/", { code: codeFrom(message) });
    assert.equal(otherCookie.status, 400);
    assert.ok(!elsewhere.cookies.has("__Host-wishlists_session"));
  });

  it("is cancelled after 5 wrong entries", async () => {
    const { browser, message } = await requestCode();
    const code = codeFrom(message);
    const wrong = code === "000000" ? "111111" : "000000";

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      assert.match((await browser.post("/wishlists/log-in/code/", { code: wrong })).text, /That code didn&#39;t work/);
    }

    assert.match((await browser.post("/wishlists/log-in/code/", { code: wrong })).text, /too many wrong codes/);
    assert.match((await browser.post("/wishlists/log-in/code/", { code })).text, /too many wrong codes/);
    assert.ok(!browser.cookies.has("__Host-wishlists_session"));

    // The link in the same email is cancelled too
    assert.equal((await new Browser(app).post("/wishlists/log-in/link/", { token: tokenFrom(message) })).status, 400);
  });

  it("gives non-members the same replies, including the limit", async () => {
    const memberBrowser = (await requestCode()).browser;
    const stranger = new Browser(app);
    await stranger.post("/wishlists/log-in/", { email: "nobody@example.test" });

    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const memberReply = await memberBrowser.post("/wishlists/log-in/code/", { code: "999999" });
      const strangerReply = await stranger.post("/wishlists/log-in/code/", { code: "999999" });

      assert.equal(memberReply.status, strangerReply.status);
      assert.equal(memberReply.text, strangerReply.text);
    }
  });

  it("stops the link from working", async () => {
    const { browser, message } = await requestCode();

    await browser.post("/wishlists/log-in/code/", { code: codeFrom(message) });
    assert.equal((await new Browser(app).post("/wishlists/log-in/link/", { token: tokenFrom(message) })).status, 400);
  });
});
