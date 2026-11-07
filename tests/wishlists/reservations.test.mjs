import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { addItem, Browser, createList, createMember, mainOf, reserveItem, startTestApp } from "./helpers.mjs";

let app;
let sam;
let alex;
let jo;
let admin;
let samId;
let alexId;
let listId;
let scarfId;
let mugsId;

before(async () => {
  app = await startTestApp();
});

after(() => app.stop());

beforeEach(async () => {
  await app.reset();
  await createMember(app, { email: "admin@example.test", name: "Léonie", role: "admin" });
  samId = await createMember(app, { email: "sam@example.test", name: "Sam" });
  alexId = await createMember(app, { email: "alex@example.test", name: "Alex" });
  await createMember(app, { email: "jo@example.test", name: "Jo" });
  sam = await new Browser(app).logIn("sam@example.test");
  alex = await new Browser(app).logIn("alex@example.test");
  jo = await new Browser(app).logIn("jo@example.test");
  admin = await new Browser(app).logIn("admin@example.test");

  listId = await createList(sam, { title: "Christmas 2026" });
  scarfId = await addItem(sam, listId, { name: "Merino scarf", url: "https://www.johnlewis.com/scarf" });
  mugsId = await addItem(sam, listId, { name: "Mugs", quantity: "4" });
});

const reservationOf = (memberId, itemId) => app.db.one("SELECT * FROM reservations WHERE reserver_id = $1 AND item_id = $2", [memberId, itemId]);

describe("reserving", () => {
  it("shows other members a Reserve button that names the item, and status as text", async () => {
    const page = await alex.get(`/wishlists/lists/${listId}/`);

    assert.match(page.text, /<p class="item-status"><strong>Status:<\/strong> Available<\/p>/);
    assert.match(page.text, /<p class="item-status"><strong>Status:<\/strong> Available: 4 wanted<\/p>/);
    assert.match(page.text, /<button type="submit" class="btn">Reserve<span data-visibility="hidden"> Merino scarf<\/span><\/button>/);
  });

  it("records the reservation, confirms it, and shows who reserved it to everyone but the owner", async () => {
    const reply = await reserveItem(alex, listId, scarfId);
    assert.equal(reply.location, `/wishlists/lists/${listId}/`);

    const page = await alex.get(reply.location);
    assert.match(page.text, /<title>Sam&#39;s list: Christmas 2026 - tink<\/title>/);
    assert.match(page.text, /You&#39;ve reserved Merino scarf/);
    assert.match(page.text, /Status:<\/strong> Reserved by you<\/p>/);
    assert.match((await jo.get(`/wishlists/lists/${listId}/`)).text, /Status:<\/strong> Reserved by Alex<\/p>/);
    assert.ok(!(await jo.get(`/wishlists/lists/${listId}/`)).text.includes("Reserve<span data-visibility=\"hidden\"> Merino scarf"));
  });

  it("lets members reserve some of the remaining quantity, using a labelled number field", async () => {
    const page = await alex.get(`/wishlists/lists/${listId}/`);
    assert.match(page.text, new RegExp(`<label for="reserve-quantity-${mugsId}">How many to reserve</label>\\s*<p class="field-hint" id="reserve-quantity-${mugsId}-hint">From 1 to 4</p>`));
    assert.match(page.text, new RegExp(`<input type="number" id="reserve-quantity-${mugsId}" name="quantity" value="1" min="1" max="4" step="1"`));

    await reserveItem(alex, listId, mugsId, 3);
    assert.match((await jo.get(`/wishlists/lists/${listId}/`)).text, /Status:<\/strong> Reserved by Alex \(3\); 1 still available<\/p>/);

    const tooMany = await reserveItem(jo, listId, mugsId, 2);
    assert.equal(tooMany.status, 409);
    assert.match(tooMany.text, /<title>Error: Sam&#39;s list: Christmas 2026 - tink<\/title>/);
    assert.match(tooMany.text, new RegExp(`<a href="#item-${mugsId}">Only 1 of Mugs is still available`));

    await reserveItem(jo, listId, mugsId, 1);
    assert.match((await alex.get(`/wishlists/lists/${listId}/`)).text, /Reserved by you \(3\); Reserved by Jo \(1\)<\/p>/);
  });

  it("gives the second of two members reserving the last one a clear error", async () => {
    // Both have the page open with the Reserve button showing
    await alex.get(`/wishlists/lists/${listId}/`);
    await jo.get(`/wishlists/lists/${listId}/`);

    const [first, second] = await Promise.all([
      alex.post(`/wishlists/lists/${listId}/items/${scarfId}/reserve/`, { quantity: "1", return_to: "list" }),
      jo.post(`/wishlists/lists/${listId}/items/${scarfId}/reserve/`, { quantity: "1", return_to: "list" })
    ]);

    assert.deepEqual([first.status, second.status].sort(), [303, 409]);
    const loser = first.status === 409 ? first : second;
    assert.match(loser.text, /Someone else has just reserved Merino scarf, so there&#39;s none left to reserve/);
    assert.equal((await app.db.query("SELECT id FROM reservations WHERE item_id = $1", [scarfId])).length, 1);
  });

  it("adds to an existing reservation rather than making a second one", async () => {
    await reserveItem(alex, listId, mugsId, 1);
    await reserveItem(alex, listId, mugsId, 2);

    assert.equal((await reservationOf(alexId, mugsId)).quantity, 3);
  });

  it("refuses quantities that aren't whole numbers in range", async () => {
    for (const quantity of ["0", "5", "-1", "two"]) {
      const reply = await reserveItem(alex, listId, mugsId, quantity);
      assert.ok([400, 409].includes(reply.status), quantity);
    }

    assert.equal(await reservationOf(alexId, mugsId), null);
  });

  it("isn't possible on archived lists or the lists of suspended members", async () => {
    await sam.get(`/wishlists/lists/${listId}/`);
    await sam.post(`/wishlists/lists/${listId}/archive/`);
    assert.equal((await reserveItem(alex, listId, scarfId)).status, 404);

    await sam.post(`/wishlists/lists/${listId}/unarchive/`);
    await app.db.query("UPDATE members SET status = 'suspended' WHERE id = $1", [samId]);
    assert.equal((await alex.post(`/wishlists/lists/${listId}/items/${scarfId}/reserve/`, { quantity: "1" })).status, 404);
  });

  it("can't be done through another list's address", async () => {
    const otherList = await createList(jo, { title: "Jo's list" });
    await alex.get(`/wishlists/lists/${otherList}/`);
    const reply = await alex.post(`/wishlists/lists/${otherList}/items/${scarfId}/reserve/`, { quantity: "1" });

    assert.equal(reply.status, 409);
    assert.equal(await reservationOf(alexId, scarfId), null);
  });
});

describe("changing a reservation", () => {
  it("with a private Bought toggle that other members never see", async () => {
    await reserveItem(alex, listId, scarfId);
    const reservation = await reservationOf(alexId, scarfId);
    const before = await jo.get(`/wishlists/lists/${listId}/`);

    let page = await alex.get(`/wishlists/lists/${listId}/`);
    assert.match(page.text, /action="[^"]+\/bought\/" class="inline-form" data-enhance>[\s\S]*?aria-pressed="false" aria-describedby="bought-hint-[^"]+">Bought<span data-visibility="hidden"> Merino scarf<\/span>/);
    assert.match(page.text, /Only you can see whether you&#39;ve bought it|Only you can see whether you've bought it/);

    await alex.post(`/wishlists/reservations/${reservation.id}/bought/`, { return_to: "list" });
    page = await alex.get(`/wishlists/lists/${listId}/`);
    assert.match(page.text, /action="[^"]+\/reserved\/" class="inline-form" data-enhance>[\s\S]*?aria-pressed="true"/);
    assert.match(page.text, /Status:<\/strong> Reserved by you<\/p>/);

    // Jo's view is identical before and after Alex buys it
    const after = await jo.get(`/wishlists/lists/${listId}/`);
    assert.equal(after.text, before.text);
    assert.ok(!/bought/i.test(mainOf(after.text)));

    await alex.post(`/wishlists/reservations/${reservation.id}/reserved/`, { return_to: "list" });
    assert.equal((await reservationOf(alexId, scarfId)).status, "reserved");
  });

  it("by cancelling, which makes the item available again", async () => {
    await reserveItem(alex, listId, scarfId);
    const reservation = await reservationOf(alexId, scarfId);

    await alex.get(`/wishlists/lists/${listId}/`);
    const reply = await alex.post(`/wishlists/reservations/${reservation.id}/cancel/`, { return_to: "list" });
    assert.equal(reply.location, `/wishlists/lists/${listId}/`);
    assert.match((await jo.get(`/wishlists/lists/${listId}/`)).text, /Merino scarf<\/h2>[\s\S]*?Status:<\/strong> Available<\/p>/);
  });

  it("by changing how many, within what's left", async () => {
    await reserveItem(alex, listId, mugsId, 1);
    await reserveItem(jo, listId, mugsId, 2);
    const reservation = await reservationOf(alexId, mugsId);

    const page = await alex.get(`/wishlists/lists/${listId}/`);
    assert.match(page.text, new RegExp(`id="change-quantity-${reservation.id}" name="quantity" value="1" min="1" max="2"`));

    assert.equal((await alex.post(`/wishlists/reservations/${reservation.id}/quantity/`, { quantity: "3", return_to: "list" })).status, 409);
    await alex.get(`/wishlists/lists/${listId}/`);
    assert.equal((await alex.post(`/wishlists/reservations/${reservation.id}/quantity/`, { quantity: "2", return_to: "list" })).status, 303);
    assert.equal((await reservationOf(alexId, mugsId)).quantity, 2);
  });

  it("only by the member who made it", async () => {
    await reserveItem(alex, listId, scarfId);
    const reservation = await reservationOf(alexId, scarfId);
    await jo.get("/wishlists/reservations/");

    for (const action of ["bought", "reserved", "cancel", "seen"]) {
      assert.equal((await jo.post(`/wishlists/reservations/${reservation.id}/${action}/`)).status, 404, action);
    }

    assert.equal((await jo.post(`/wishlists/reservations/${reservation.id}/quantity/`, { quantity: "1" })).status, 404);
    assert.equal((await reservationOf(alexId, scarfId)).status, "reserved");
  });
});

describe("My reservations", () => {
  it("lists everything reserved, grouped by person, as a shopping list", async () => {
    const joList = await createList(jo, { title: "Birthday" });
    const bookId = await addItem(jo, joList, { name: "Book" });
    await reserveItem(alex, listId, scarfId);
    await reserveItem(alex, listId, mugsId, 2);
    await reserveItem(alex, joList, bookId);

    const page = await alex.get("/wishlists/reservations/");
    const main = mainOf(page.text);

    assert.match(main, /<h2 id="for-1">For Jo<\/h2>[\s\S]*Book[\s\S]*<h2 id="for-2">For Sam<\/h2>[\s\S]*Merino scarf[\s\S]*Mugs/);
    assert.match(main, new RegExp(`On <a href="/wishlists/lists/${listId}/">Christmas 2026</a>`));
    assert.match(main, /<a href="https:\/\/www.johnlewis.com\/scarf">Merino scarf at johnlewis.com<\/a>/);
    assert.match(main, /You(&#39;|')ve reserved 2 of the 4 wanted\./);
  });

  it("splits each person's items into To buy and Bought", async () => {
    await reserveItem(alex, listId, scarfId);
    await reserveItem(alex, listId, mugsId, 1);
    const scarf = await reservationOf(alexId, scarfId);

    let main = mainOf((await alex.get("/wishlists/reservations/")).text);
    assert.match(main, /<h2 id="for-1">For Sam<\/h2>\s*<h3>To buy<\/h3>[\s\S]*<h4>Merino scarf<\/h4>[\s\S]*<h4>Mugs<\/h4>/);
    assert.ok(!main.includes("<h3>Bought</h3>"));

    await alex.post(`/wishlists/reservations/${scarf.id}/bought/`, { return_to: "reservations" });
    main = mainOf((await alex.get("/wishlists/reservations/")).text);
    assert.match(main, /<h3>To buy<\/h3>[\s\S]*<h4>Mugs<\/h4>[\s\S]*<h3>Bought<\/h3>[\s\S]*<h4>Merino scarf<\/h4>/);
    assert.ok(!/<(ul|ol)\b/.test(main.slice(main.indexOf('id="reservations"'))));
  });

  it("returns changes made there to My reservations", async () => {
    await reserveItem(alex, listId, scarfId);
    const reservation = await reservationOf(alexId, scarfId);
    await alex.get("/wishlists/reservations/");
    const reply = await alex.post(`/wishlists/reservations/${reservation.id}/bought/`, { return_to: "reservations" });

    assert.equal(reply.location, "/wishlists/reservations/");
    assert.match((await alex.get(reply.location)).text, /<title>My reservations - tink<\/title>/);
  });

  it("is empty with a pointer to everyone's lists", async () => {
    assert.match((await alex.get("/wishlists/reservations/")).text, /You haven&#39;t reserved anything yet|You haven't reserved anything yet/);
  });

  it("shows \"Changed since you reserved it\" after the owner edits the item, until it's marked as seen", async () => {
    await reserveItem(alex, listId, scarfId);
    assert.ok(!(await alex.get("/wishlists/reservations/")).text.includes("Changed since you reserved it"));

    // Moving an item isn't a change to it
    await sam.get(`/wishlists/lists/${listId}/`);
    await sam.post(`/wishlists/lists/${listId}/items/${mugsId}/move-up/`);
    assert.ok(!(await alex.get("/wishlists/reservations/")).text.includes("Changed since you reserved it"));

    await app.db.query("UPDATE reservations SET item_seen_at = item_seen_at - interval '1 minute'");
    await app.db.query("UPDATE items SET updated_at = updated_at - interval '1 minute'");
    await sam.get(`/wishlists/lists/${listId}/items/${scarfId}/edit/`);
    await sam.post(`/wishlists/lists/${listId}/items/${scarfId}/edit/`, { name: "Merino scarf", price: "", quantity: "1", url: "https://www.johnlewis.com/scarf-green" });

    assert.match((await alex.get("/wishlists/reservations/")).text, /Changed since you reserved it/);
    assert.match((await alex.get(`/wishlists/lists/${listId}/`)).text, /Changed since you reserved it/);

    const reservation = await reservationOf(alexId, scarfId);
    await alex.get("/wishlists/reservations/");
    await alex.post(`/wishlists/reservations/${reservation.id}/seen/`, { return_to: "reservations" });
    assert.ok(!(await alex.get("/wishlists/reservations/")).text.includes("Changed since you reserved it"));
  });

  it("shows items the owner deleted as removed from their list", async () => {
    await reserveItem(alex, listId, scarfId);
    await sam.get(`/wishlists/lists/${listId}/`);
    await sam.post(`/wishlists/lists/${listId}/items/${scarfId}/delete/`);

    const reservation = await app.db.one("SELECT item_id, item_snapshot FROM reservations WHERE reserver_id = $1", [alexId]);
    assert.equal(reservation.item_id, null);
    assert.equal(reservation.item_snapshot.name, "Merino scarf");

    const page = await alex.get("/wishlists/reservations/");
    assert.match(page.text, /<h4>Merino scarf<\/h4>\s*<p class="item-status"><strong>Removed from Sam(&#39;|')s list\./);

    const id = (await app.db.one("SELECT id FROM reservations")).id;
    await alex.post(`/wishlists/reservations/${id}/cancel/`, { return_to: "reservations" });
    assert.equal((await app.db.query("SELECT id FROM reservations")).length, 0);
  });

  it("shows items on a deleted list as removed", async () => {
    await reserveItem(alex, listId, scarfId);
    await reserveItem(jo, listId, mugsId, 2);
    await sam.get(`/wishlists/lists/${listId}/delete/`);
    await sam.post(`/wishlists/lists/${listId}/delete/`);

    assert.match((await alex.get("/wishlists/reservations/")).text, /Removed from Sam/);
    assert.match((await jo.get("/wishlists/reservations/")).text, /Mugs<\/h4>\s*<p class="item-status"><strong>Removed from Sam/);
  });

  it("shows items as removed when their owner is removed", async () => {
    await reserveItem(alex, listId, scarfId);
    await admin.get(`/wishlists/admin/members/${samId}/remove/`);
    await admin.post(`/wishlists/admin/members/${samId}/remove/`);

    assert.match((await alex.get("/wishlists/reservations/")).text, /Merino scarf<\/h4>\s*<p class="item-status"><strong>Removed from Sam/);
  });

  it("keeps a reservation on an archived list, without a link to it", async () => {
    await reserveItem(alex, listId, scarfId);
    await sam.get(`/wishlists/lists/${listId}/`);
    await sam.post(`/wishlists/lists/${listId}/archive/`);

    const page = await alex.get("/wishlists/reservations/");
    assert.match(page.text, /On Christmas 2026 \(no longer shared\)/);
    assert.ok(!page.text.includes(`href="/wishlists/lists/${listId}/"`));
  });
});

describe("removing members", () => {
  it("deletes the removed member's reservations, so the items show as available again", async () => {
    await reserveItem(alex, listId, scarfId);
    await admin.get(`/wishlists/admin/members/${alexId}/remove/`);
    await admin.post(`/wishlists/admin/members/${alexId}/remove/`);

    assert.equal((await app.db.query("SELECT id FROM reservations")).length, 0);
    assert.match((await jo.get(`/wishlists/lists/${listId}/`)).text, /Merino scarf<\/h2>[\s\S]*?Status:<\/strong> Available<\/p>/);
  });

  it("deletes a member's reservations when they delete their own account", async () => {
    await reserveItem(alex, listId, scarfId);
    await alex.get("/wishlists/account/delete/");
    await alex.post("/wishlists/account/delete/");

    assert.equal((await app.db.query("SELECT id FROM reservations")).length, 0);
  });
});
