// Surprise protection: a list owner must never be able to tell whether, or how many of,
// their items are reserved or bought. These tests look from the owner's side only.
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { addItem, Browser, createList, createMember, reserveItem, startTestApp } from "./helpers.mjs";

let app;
let sam;
let alex;
let jo;
let admin;
let alexId;
let joId;

before(async () => {
  app = await startTestApp();
});

after(() => app.stop());

// Also used to start a comparison again from nothing
async function setUp() {
  await app.reset();
  await createMember(app, { email: "admin@example.test", name: "Léonie", role: "admin" });
  await createMember(app, { email: "sam@example.test", name: "Sam" });
  alexId = await createMember(app, { email: "alex@example.test", name: "Alex" });
  joId = await createMember(app, { email: "jo@example.test", name: "Jo" });
  sam = await new Browser(app).logIn("sam@example.test");
  alex = await new Browser(app).logIn("alex@example.test");
  jo = await new Browser(app).logIn("jo@example.test");
  admin = await new Browser(app).logIn("admin@example.test");
}

beforeEach(setUp);

// Every page the owner can open about their own lists
async function ownerPages(owner, listId, itemIds, extraPaths = []) {
  const paths = [
    `/wishlists/lists/${listId}/`,
    `/wishlists/lists/${listId}/edit/`,
    `/wishlists/lists/${listId}/delete/`,
    `/wishlists/lists/${listId}/items/new/`,
    ...itemIds.flatMap((itemId) => [`/wishlists/lists/${listId}/items/${itemId}/edit/`, `/wishlists/lists/${listId}/items/${itemId}/delete/`]),
    "/wishlists/mine/",
    "/wishlists/",
    "/wishlists/reservations/",
    "/wishlists/account/",
    "/wishlists/help/",
    ...extraPaths
  ];
  const pages = {};

  // Uses up any confirmation message still waiting from the owner's last change
  await owner.get("/wishlists/help/");

  for (const path of paths) {
    const reply = await owner.get(path);
    pages[path] = { setCookies: reply.setCookies, status: reply.status, text: reply.text };
  }

  return pages;
}

// Others reserve, change and buy the owner's items
async function reserveEverything(listId, scarfId, mugsId) {
  await reserveItem(alex, listId, scarfId);
  await reserveItem(jo, listId, mugsId, 3);
  const reservation = await app.db.one("SELECT id FROM reservations WHERE reserver_id = $1", [alexId]);
  await alex.get("/wishlists/reservations/");
  await alex.post(`/wishlists/reservations/${reservation.id}/bought/`, { return_to: "reservations" });
}

// Makes responses from separate runs comparable: IDs, CSRF tokens and session tokens differ
function normalise(text, names = []) {
  let result = String(text)
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "<id>")
    .replace(/[0-9a-f]{64}/g, "<csrf>")
    .replace(/(__Host-wishlists_(session|pending)=)[A-Za-z0-9_-]+/g, "$1<token>");

  for (const name of names) {
    result = result.split(name).join("<name>");
  }

  return result;
}

function comparable(reply, names) {
  return {
    location: reply.location && normalise(reply.location, names),
    setCookies: reply.setCookies.map((cookie) => normalise(cookie, names)),
    status: reply.status,
    text: normalise(reply.text, names)
  };
}

describe("the owner's view", () => {
  it("is exactly the same, byte for byte, after others reserve, buy and cancel", async () => {
    const listId = await createList(sam, { occasion_date: "2026-12-25", title: "Christmas 2026" });
    const scarfId = await addItem(sam, listId, { name: "Merino scarf" });
    const mugsId = await addItem(sam, listId, { name: "Mugs", quantity: "4" });
    const before = await ownerPages(sam, listId, [scarfId, mugsId]);

    await reserveEverything(listId, scarfId, mugsId);
    assert.equal((await app.db.query("SELECT id FROM reservations")).length, 2);
    assert.deepEqual(await ownerPages(sam, listId, [scarfId, mugsId]), before);

    const joReservation = await app.db.one("SELECT id FROM reservations WHERE reserver_id = $1", [joId]);
    await jo.get("/wishlists/reservations/");
    await jo.post(`/wishlists/reservations/${joReservation.id}/cancel/`, { return_to: "reservations" });
    assert.deepEqual(await ownerPages(sam, listId, [scarfId, mugsId]), before);
  });

  it("is the same for the admin's own lists, including the Members page", async () => {
    const listId = await createList(admin, { title: "Birthday" });
    const scarfId = await addItem(admin, listId, { name: "Merino scarf" });
    const mugsId = await addItem(admin, listId, { name: "Mugs", quantity: "4" });
    const extra = ["/wishlists/admin/members/"];
    const before = await ownerPages(admin, listId, [scarfId, mugsId], extra);

    await reserveEverything(listId, scarfId, mugsId);
    assert.deepEqual(await ownerPages(admin, listId, [scarfId, mugsId], extra), before);
  });

  it("contains no reservation fields, statuses or reservers' names", async () => {
    const listId = await createList(sam, { title: "Christmas 2026" });
    const scarfId = await addItem(sam, listId, { name: "Merino scarf" });
    const mugsId = await addItem(sam, listId, { name: "Mugs", quantity: "4" });
    await reserveEverything(listId, scarfId, mugsId);

    // Pages about the owner's own lists and items. The others (Everyone's lists, Account,
    // Help) mention other members and reservations in general, and the byte-for-byte test
    // above shows reservations don't change them.
    const ownPages = Object.entries(await ownerPages(sam, listId, [scarfId, mugsId]))
      .filter(([path]) => path.startsWith("/wishlists/lists/") || path === "/wishlists/mine/" || path === "/wishlists/reservations/");

    for (const [path, page] of ownPages) {
      // The site's header (with the "My reservations" link) and footer ("All rights reserved") aside
      const body = page.text.replace(/<header>[\s\S]*?<\/header>/, "").replace(/<footer>[\s\S]*?<\/footer>/, "");

      if (path === "/wishlists/reservations/") {
        assert.match(body, /You haven(&#39;|')t reserved anything yet/, path);
        continue;
      }

      for (const pattern of [/reserv/i, /bought/i, /available/i, /item-status/, /Status:/, /\bAlex\b/, /\bJo\b/]) {
        assert.ok(!pattern.test(body), `${path} matches ${pattern}`);
      }
    }
  });

  it("gets no email when others reserve or buy", async () => {
    const listId = await createList(sam, { title: "Christmas 2026" });
    const scarfId = await addItem(sam, listId, { name: "Merino scarf" });
    const mugsId = await addItem(sam, listId, { name: "Mugs", quantity: "4" });
    const before = app.mail.length;

    await reserveEverything(listId, scarfId, mugsId);
    assert.equal(app.mail.length, before);
  });
});

describe("the owner's actions", () => {
  // Runs the same steps twice from nothing: once with the item reserved and bought by
  // another member, once without. Everything the owner gets back must be the same.
  async function sameEitherWay(action) {
    const results = [];

    for (const reserved of [true, false]) {
      await setUp();
      const listId = await createList(sam, { title: "Birthday" });
      const itemId = await addItem(sam, listId, { name: "Book", quantity: "3" });

      if (reserved) {
        await reserveItem(alex, listId, itemId, 2);
        const reservation = await app.db.one("SELECT id FROM reservations");
        await alex.get("/wishlists/reservations/");
        await alex.post(`/wishlists/reservations/${reservation.id}/bought/`, { return_to: "reservations" });
      }

      await sam.get("/wishlists/help/");
      const replies = await action(listId, itemId);
      const last = replies.at(-1);
      const next = last.location ? await sam.get(last.location) : null;

      results.push([...replies, ...(next ? [next] : [])].map((reply) => comparable(reply)));
    }

    assert.deepEqual(results[0], results[1]);
  }

  it("deleting a reserved item looks exactly the same as deleting an unreserved one", async () => {
    await sameEitherWay(async (listId, itemId) => [
      await sam.get(`/wishlists/lists/${listId}/`),
      await sam.get(`/wishlists/lists/${listId}/items/${itemId}/delete/`),
      await sam.post(`/wishlists/lists/${listId}/items/${itemId}/delete/`)
    ]);
  });

  it("deleting a list with reserved items looks exactly the same as deleting one without", async () => {
    await sameEitherWay(async (listId) => [
      await sam.get(`/wishlists/lists/${listId}/`),
      await sam.get(`/wishlists/lists/${listId}/delete/`),
      await sam.post(`/wishlists/lists/${listId}/delete/`)
    ]);
  });

  it("lowering the quantity of a reserved item looks exactly the same as for an unreserved one", async () => {
    await sameEitherWay(async (listId, itemId) => [
      await sam.get(`/wishlists/lists/${listId}/items/${itemId}/edit/`),
      await sam.post(`/wishlists/lists/${listId}/items/${itemId}/edit/`, { name: "Book", price: "", quantity: "1", url: "" })
    ]);
  });

  it("moving a reserved item looks exactly the same as moving an unreserved one", async () => {
    await sameEitherWay(async (listId, itemId) => {
      await addItem(sam, listId, { name: "Pen" });
      await sam.get("/wishlists/help/");
      return [
        await sam.get(`/wishlists/lists/${listId}/`),
        await sam.post(`/wishlists/lists/${listId}/items/${itemId}/move-down/`)
      ];
    });
  });

  it("trying to reserve their own item gets the same refusal whether or not it's reserved", async () => {
    await sameEitherWay(async (listId, itemId) => [
      await sam.get(`/wishlists/lists/${listId}/`),
      await sam.post(`/wishlists/lists/${listId}/items/${itemId}/reserve/`, { quantity: "1", return_to: "list" })
    ]);
  });

  it("still lets reservers see what the owner deleted", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const itemId = await addItem(sam, listId, { name: "Book" });
    await reserveItem(alex, listId, itemId);
    await sam.get(`/wishlists/lists/${listId}/`);
    await sam.post(`/wishlists/lists/${listId}/delete/`);

    assert.match((await alex.get("/wishlists/reservations/")).text, /Book<\/h4>\s*<p class="item-status"><strong>Removed from Sam/);
  });

  it("can't reach someone's reservation of their item by its ID", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const itemId = await addItem(sam, listId, { name: "Book" });
    await reserveItem(alex, listId, itemId);
    const reservation = await app.db.one("SELECT id FROM reservations");
    const missing = "00000000-0000-4000-8000-000000000000";

    await sam.get(`/wishlists/lists/${listId}/`);
    for (const action of ["bought", "reserved", "cancel", "seen"]) {
      const real = await sam.post(`/wishlists/reservations/${reservation.id}/${action}/`);
      const fake = await sam.post(`/wishlists/reservations/${missing}/${action}/`);
      assert.equal(real.status, 404, action);
      assert.equal(normalise(real.text), normalise(fake.text), action);
    }

    assert.equal((await app.db.one("SELECT status FROM reservations")).status, "reserved");
  });

  it("the database refuses a reservation by the list's owner, whatever the app does", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const itemId = await addItem(sam, listId, { name: "Book" });
    const samId = (await app.db.one("SELECT id FROM members WHERE email = 'sam@example.test'")).id;

    await assert.rejects(
      app.db.query("INSERT INTO reservations (item_id, reserver_id, quantity, item_snapshot, item_seen_at) VALUES ($1, $2, 1, '{}', now())", [itemId, samId]),
      /cannot reserve items on their own list/
    );
  });
});

describe("the admin removing a member", () => {
  it("looks the same whether or not the member had reserved the admin's items", async () => {
    const results = [];

    for (const reserved of [true, false]) {
      await setUp();
      const listId = await createList(admin, { title: "Birthday" });
      const itemId = await addItem(admin, listId, { name: "Book" });

      if (reserved) {
        await reserveItem(alex, listId, itemId);
      }

      await admin.get("/wishlists/help/");
      const confirm = await admin.get(`/wishlists/admin/members/${alexId}/remove/`);
      const reply = await admin.post(`/wishlists/admin/members/${alexId}/remove/`);
      const next = await admin.get(reply.location);
      const list = await admin.get(`/wishlists/lists/${listId}/`);
      results.push([confirm, reply, next, list].map((response) => comparable(response)));
    }

    assert.deepEqual(results[0], results[1]);
  });
});
