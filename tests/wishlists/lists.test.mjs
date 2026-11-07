import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { Browser, createMember, startTestApp } from "./helpers.mjs";

let app;
let sam;
let alex;
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
  await createMember(app, { email: "alex@example.test", name: "Alex" });
  sam = await new Browser(app).logIn("sam@example.test");
  alex = await new Browser(app).logIn("alex@example.test");
  admin = await new Browser(app).logIn("admin@example.test");
});

async function createList(browser, fields) {
  await browser.get("/wishlists/mine/new/");
  const reply = await browser.post("/wishlists/mine/new/", { description: "", occasion_date: "", ...fields });
  assert.equal(reply.status, 303, `creating list ${fields.title}`);
  return reply.location.match(/lists\/([0-9a-f-]{36})\//)[1];
}

async function addItem(browser, listId, fields) {
  await browser.get(`/wishlists/lists/${listId}/items/new/`);
  const reply = await browser.post(`/wishlists/lists/${listId}/items/new/`, { price: "", quantity: "", url: "", ...fields });
  assert.equal(reply.status, 303, `adding item ${fields.name}`);
  return (await app.db.one("SELECT id FROM items WHERE list_id = $1 AND name = $2", [listId, fields.name])).id;
}

const itemNames = async (listId) => (await app.db.query("SELECT name FROM items WHERE list_id = $1 ORDER BY position", [listId])).map((row) => row.name);

describe("lists", () => {
  it("are created by their owner and confirmed after the redirect", async () => {
    const listId = await createList(sam, { description: "Thanks!\nNo socks.", occasion_date: "2026-12-25", title: "Christmas 2026" });
    const page = await sam.get(`/wishlists/lists/${listId}/`);

    assert.match(page.text, /<title>Christmas 2026 - tink<\/title>/);
    assert.match(page.text, /<h1>Christmas 2026<\/h1>/);
    assert.match(page.text, /<time datetime="2026-12-25">25 December 2026<\/time>/);
    assert.match(page.text, /<p class="wishlists-multiline">Thanks!\nNo socks\.<\/p>/);
  });

  it("need a title, and a real date if there is one", async () => {
    await sam.get("/wishlists/mine/new/");
    const reply = await sam.post("/wishlists/mine/new/", { description: "Kept", occasion_date: "2026-02-30", title: "" });

    assert.equal(reply.status, 400);
    assert.match(reply.text, /<a href="#title">Enter a title for the list<\/a>/);
    assert.match(reply.text, /<a href="#occasion_date">Enter a real date/);
    assert.match(reply.text, /value="2026-02-30"/);
    assert.match(reply.text, />Kept<\/textarea>/);
    assert.equal((await app.db.query("SELECT id FROM lists")).length, 0);
  });

  it("appear on Everyone's lists and the owner's page for other members, and on My lists for the owner", async () => {
    const listId = await createList(sam, { title: "Birthday" });

    assert.match((await alex.get("/wishlists/")).text, new RegExp(`<a href="/wishlists/lists/${listId}/">Birthday</a>`));
    assert.match((await alex.get(`/wishlists/people/${samId}/`)).text, /<h1>Sam's lists<\/h1>[\s\S]*Birthday/);
    assert.match((await sam.get("/wishlists/mine/")).text, /Birthday/);
    assert.ok(!(await sam.get("/wishlists/")).text.includes("Birthday"));
    assert.equal((await sam.get(`/wishlists/people/${samId}/`)).location, "/wishlists/mine/");
  });

  it("can be edited by the owner only", async () => {
    const listId = await createList(sam, { title: "Birthday" });

    await sam.get(`/wishlists/lists/${listId}/edit/`);
    await sam.post(`/wishlists/lists/${listId}/edit/`, { description: "", occasion_date: "", title: "Birthday 2027" });
    assert.equal((await app.db.one("SELECT title FROM lists")).title, "Birthday 2027");

    assert.equal((await alex.get(`/wishlists/lists/${listId}/edit/`)).status, 404);
    await alex.get("/wishlists/account/");
    assert.equal((await alex.post(`/wishlists/lists/${listId}/edit/`, { title: "Hacked" })).status, 404);
    assert.equal((await app.db.one("SELECT title FROM lists")).title, "Birthday 2027");
  });

  it("when archived, are hidden from other members but kept for the owner", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    await sam.get(`/wishlists/lists/${listId}/`);
    await sam.post(`/wishlists/lists/${listId}/archive/`);

    assert.equal((await alex.get(`/wishlists/lists/${listId}/`)).status, 404);
    assert.ok(!(await alex.get("/wishlists/")).text.includes("Birthday"));
    assert.match((await sam.get("/wishlists/mine/")).text, /Archived lists[\s\S]*Birthday/);
    assert.match((await sam.get(`/wishlists/lists/${listId}/`)).text, /This list is archived/);

    await sam.post(`/wishlists/lists/${listId}/unarchive/`);
    assert.equal((await alex.get(`/wishlists/lists/${listId}/`)).status, 200);
  });

  it("prompt the owner to archive once the occasion date has passed", async () => {
    const listId = await createList(sam, { occasion_date: "2025-12-25", title: "Christmas 2025" });

    assert.match((await sam.get("/wishlists/mine/")).text, /The occasion date has passed/);
    assert.match((await sam.get(`/wishlists/lists/${listId}/`)).text, /The occasion date has passed/);
    assert.ok(!(await alex.get(`/wishlists/lists/${listId}/`)).text.includes("occasion date has passed"));
  });

  it("of suspended members are hidden from other members", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    await app.db.query("UPDATE members SET status = 'suspended' WHERE id = $1", [samId]);

    assert.equal((await alex.get(`/wishlists/lists/${listId}/`)).status, 404);
    assert.equal((await alex.get(`/wishlists/people/${samId}/`)).status, 404);
    assert.ok(!(await alex.get("/wishlists/")).text.includes("Sam"));
  });
});

describe("deleting lists", () => {
  it("asks on a page that names the list and its items, then deletes both", async () => {
    const listId = await createList(sam, { title: "Christmas 2026" });
    await addItem(sam, listId, { name: "Scarf" });
    await addItem(sam, listId, { name: "Book" });

    const confirm = await sam.get(`/wishlists/lists/${listId}/delete/`);
    assert.match(confirm.text, /<h1>Delete Christmas 2026\?<\/h1>/);
    assert.match(confirm.text, /It has 2 items, which will be deleted too/);
    assert.match(confirm.text, /<button type="submit" class="btn">Delete Christmas 2026<\/button>/);

    const reply = await sam.post(`/wishlists/lists/${listId}/delete/`);
    assert.equal(reply.location, "/wishlists/mine/");
    assert.match((await sam.get("/wishlists/mine/")).text, /<title>My lists - tink<\/title>[\s\S]*Christmas 2026 and its 2 items are deleted/);
    assert.equal((await app.db.query("SELECT id FROM items")).length, 0);
  });

  it("offers the same confirmation as a dialog, with a page to fall back on", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const page = await sam.get(`/wishlists/lists/${listId}/`);

    assert.match(page.text, new RegExp(`<a href="/wishlists/lists/${listId}/delete/" data-dialog="delete-list">Delete list`));
    assert.match(page.text, /<dialog id="delete-list" class="wishlists-dialog" aria-labelledby="delete-list-heading">/);
    assert.match(page.text, /<button type="button" class="btn btn-secondary" data-close-dialog autofocus>Keep Birthday<\/button>/);
    // Keep comes before Delete, so Tab goes from Keep to Delete
    assert.match(page.text, /data-close-dialog autofocus>Keep Birthday<\/button>\s*<form[^>]*>\s*<input type="hidden" name="_csrf"[^>]*>\s*<button type="submit" class="btn">Delete Birthday<\/button>/);
    assert.match(page.text, /<script src="\/js\/wishlists.js" defer><\/script>/);
  });

  it("can't be done by another member, but can by the admin", async () => {
    const listId = await createList(sam, { title: "Birthday" });

    assert.equal((await alex.get(`/wishlists/lists/${listId}/delete/`)).status, 404);
    await alex.get("/wishlists/account/");
    assert.equal((await alex.post(`/wishlists/lists/${listId}/delete/`)).status, 404);
    assert.ok(!(await alex.get(`/wishlists/lists/${listId}/`)).text.includes("data-dialog"));

    const confirm = await admin.get(`/wishlists/lists/${listId}/delete/`);
    assert.match(confirm.text, /This is Sam's list/);
    const reply = await admin.post(`/wishlists/lists/${listId}/delete/`);
    assert.equal(reply.location, `/wishlists/people/${samId}/`);
    assert.equal((await app.db.query("SELECT id FROM lists")).length, 0);
    assert.equal((await app.db.one("SELECT action FROM audit_log WHERE action = 'delete-list'")).action, "delete-list");
  });

  it("happens when the owner is removed", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    await addItem(sam, listId, { name: "Scarf" });

    await admin.get(`/wishlists/admin/members/${samId}/remove/`);
    await admin.post(`/wishlists/admin/members/${samId}/remove/`);

    assert.equal((await app.db.query("SELECT id FROM lists")).length, 0);
    assert.equal((await app.db.query("SELECT id FROM items")).length, 0);
  });
});

describe("items", () => {
  it("are added with all their fields, and shown with the shop's domain", async () => {
    const listId = await createList(sam, { title: "Christmas 2026" });
    await addItem(sam, listId, {
      most_wanted: "yes",
      name: "Merino scarf",
      notes: "Green or blue.\nNot red.",
      price: "30",
      quantity: "2",
      similar_ok: "yes",
      url: "https://www.johnlewis.com/scarf?colour=green"
    });

    const page = await alex.get(`/wishlists/lists/${listId}/`);
    assert.match(page.text, /<div class="wishlists-item" id="item-[0-9a-f-]+" data-item-block>\n<h2>Merino scarf<\/h2>/);
    assert.ok(!page.text.includes("<h2>Items</h2>"));
    assert.ok(!/<(ol|ul) class="wishlists-items"/.test(page.text));
    assert.match(page.text, /<a href="https:\/\/www.johnlewis.com\/scarf\?colour=green">Merino scarf at johnlewis.com<\/a>/);
    assert.match(page.text, /<li>Most wanted<\/li>\n<li>Similar is fine<\/li>/);
    assert.match(page.text, /<dt>Price<\/dt><dd>£30<\/dd>/);
    assert.match(page.text, /<dt>Quantity wanted<\/dt><dd>2<\/dd>/);
    assert.match(page.text, /<p class="wishlists-multiline">Green or blue.\nNot red.<\/p>/);
  });

  it("show the price in the chosen currency, with pounds as the default", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const form = await sam.get(`/wishlists/lists/${listId}/items/new/`);

    assert.match(form.text, /<label for="price_currency">Currency<\/label>\s*<select id="price_currency" name="price_currency">\s*<option value="GBP" selected>£<\/option>\s*<option value="USD">\$<\/option>\s*<option value="EUR">€<\/option>/);
    assert.ok(form.text.indexOf('id="price_currency"') < form.text.indexOf('id="price"'));
    assert.match(form.text, /<input type="number" id="price" name="price" value="" inputmode="decimal" min="0" step="0.01"/);

    await addItem(sam, listId, { name: "Book", price: "12.5", price_currency: "USD" });
    await addItem(sam, listId, { name: "Socks", price: "15", price_currency: "EUR" });
    await addItem(sam, listId, { name: "Mug", price: "", price_currency: "GBP" });
    const page = await alex.get(`/wishlists/lists/${listId}/`);

    assert.match(page.text, /<dt>Price<\/dt><dd>\$12.50<\/dd>/);
    assert.match(page.text, /<dt>Price<\/dt><dd>€15<\/dd>/);
    assert.equal((page.text.match(/<dt>Price<\/dt>/g) || []).length, 2);

    const bookId = (await app.db.one("SELECT id FROM items WHERE name = 'Book'")).id;
    const edit = await sam.get(`/wishlists/lists/${listId}/items/${bookId}/edit/`);
    assert.match(edit.text, /<option value="USD" selected>\$<\/option>/);
    assert.match(edit.text, /id="price" name="price" value="12.5"/);
  });

  it("only accept a number for the price, and an unknown currency becomes pounds", async () => {
    const listId = await createList(sam, { title: "Birthday" });

    for (const price of ["about 30", "£30", "-5", "1.234", "12,50"]) {
      await sam.get(`/wishlists/lists/${listId}/items/new/`);
      const reply = await sam.post(`/wishlists/lists/${listId}/items/new/`, { name: "Thing", price });
      assert.equal(reply.status, 400, price);
      assert.match(reply.text, /<a href="#price">Enter the price as a number/);
    }

    await addItem(sam, listId, { name: "Thing", price: "5", price_currency: "XYZ" });
    assert.equal((await app.db.one("SELECT price_currency FROM items")).price_currency, "GBP");
  });

  it("have hints on both checkboxes", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const page = await sam.get(`/wishlists/lists/${listId}/items/new/`);

    assert.match(page.text, /id="most_wanted" name="most_wanted" value="yes" aria-describedby="most_wanted-hint">\s*<label for="most_wanted">Most wanted<\/label>\s*<p class="field-hint" id="most_wanted-hint">Really hoping for this<\/p>/);
    assert.match(page.text, /<p class="field-hint" id="similar_ok-hint">Something like it would be just as welcome<\/p>/);
  });

  it("default to a quantity of 1", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    await addItem(sam, listId, { name: "Book" });

    assert.equal((await app.db.one("SELECT quantity, most_wanted, similar_ok FROM items")).quantity, 1);
  });

  it("only accept https links", async () => {
    const listId = await createList(sam, { title: "Birthday" });

    for (const url of ["javascript:alert(1)", "data:text/html,hi", "http://example.com/", "example.com", `https://example.com/${"a".repeat(2000)}`]) {
      await sam.get(`/wishlists/lists/${listId}/items/new/`);
      const reply = await sam.post(`/wishlists/lists/${listId}/items/new/`, { name: "Thing", url });

      assert.equal(reply.status, 400, url.slice(0, 30));
      assert.match(reply.text, /<a href="#url">/);
    }

    assert.equal((await app.db.query("SELECT id FROM items")).length, 0);
  });

  it("check the name, quantity and lengths, and keep what was entered", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    await sam.get(`/wishlists/lists/${listId}/items/new/`);
    const reply = await sam.post(`/wishlists/lists/${listId}/items/new/`, {
      most_wanted: "yes",
      name: "",
      notes: "x".repeat(1001),
      price: "5",
      quantity: "1.5"
    });

    assert.equal(reply.status, 400);
    assert.match(reply.text, /<title>Error: Add an item to Birthday - tink<\/title>/);
    assert.match(reply.text, /Enter the item&#39;s name/);
    assert.match(reply.text, /<a href="#quantity">Enter a whole number from 1 to 99<\/a>/);
    assert.match(reply.text, /Notes must be 1,000 characters or fewer/);
    assert.match(reply.text, /id="price" name="price" value="5"/);
    assert.match(reply.text, /id="most_wanted" name="most_wanted" value="yes" checked/);

    for (const quantity of ["0", "100", "-1", "two"]) {
      await sam.get(`/wishlists/lists/${listId}/items/new/`);
      assert.equal((await sam.post(`/wishlists/lists/${listId}/items/new/`, { name: "Thing", quantity })).status, 400, quantity);
    }
  });

  it("have a native number field for the quantity, with a visible label and set limits", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const page = await sam.get(`/wishlists/lists/${listId}/items/new/`);

    assert.match(page.text, /<label for="quantity">Quantity wanted<\/label>\s*<input type="number" id="quantity" name="quantity" value="1" min="1" max="99" step="1">/);
    assert.ok(!page.text.includes("A whole number from 1 to 99"));
  });

  it("can be edited, and only real changes count as changes", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const itemId = await addItem(sam, listId, { name: "Book", quantity: "1" });
    await app.db.query("UPDATE items SET updated_at = now() - interval '1 day'");
    const before = (await app.db.one("SELECT updated_at FROM items")).updated_at;

    await sam.get(`/wishlists/lists/${listId}/items/${itemId}/edit/`);
    await sam.post(`/wishlists/lists/${listId}/items/${itemId}/edit/`, { name: "Book", price: "", quantity: "1", url: "" });
    assert.deepEqual((await app.db.one("SELECT updated_at FROM items")).updated_at, before);

    await sam.get(`/wishlists/lists/${listId}/items/${itemId}/edit/`);
    await sam.post(`/wishlists/lists/${listId}/items/${itemId}/edit/`, { name: "Signed book", price: "", quantity: "1", url: "" });
    const edited = await app.db.one("SELECT name, updated_at FROM items");
    assert.equal(edited.name, "Signed book");
    assert.ok(edited.updated_at > before);
  });

  it("move up and down with buttons that name the item", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    await addItem(sam, listId, { name: "Book" });
    const scarfId = await addItem(sam, listId, { name: "Scarf" });
    await addItem(sam, listId, { name: "Mug" });

    const page = await sam.get(`/wishlists/lists/${listId}/`);
    assert.match(page.text, /Move up<span data-visibility="hidden"> Scarf<\/span>/);
    assert.match(page.text, /Move down<span data-visibility="hidden"> Scarf<\/span>/);
    assert.ok(!page.text.includes('Move up<span data-visibility="hidden"> Book</span>'));
    assert.ok(!page.text.includes('Move down<span data-visibility="hidden"> Mug</span>'));

    const reply = await sam.post(`/wishlists/lists/${listId}/items/${scarfId}/move-up/`);
    assert.equal(reply.location, `/wishlists/lists/${listId}/`);
    assert.deepEqual(await itemNames(listId), ["Scarf", "Book", "Mug"]);
    assert.match((await sam.get(reply.location)).text, /<title>Birthday - tink<\/title>[\s\S]*Scarf is now number 1 of 3/);

    await sam.post(`/wishlists/lists/${listId}/items/${scarfId}/move-down/`);
    await sam.get(`/wishlists/lists/${listId}/`);
    await sam.post(`/wishlists/lists/${listId}/items/${scarfId}/move-down/`);
    assert.deepEqual(await itemNames(listId), ["Book", "Mug", "Scarf"]);
  });

  it("can be deleted after confirmation", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const itemId = await addItem(sam, listId, { name: "Book" });

    assert.match((await sam.get(`/wishlists/lists/${listId}/items/${itemId}/delete/`)).text, /<h1>Delete Book\?<\/h1>/);
    const reply = await sam.post(`/wishlists/lists/${listId}/items/${itemId}/delete/`);

    assert.equal(reply.location, `/wishlists/lists/${listId}/`);
    assert.match((await sam.get(reply.location)).text, /<title>Birthday - tink<\/title>[\s\S]*Book is deleted/);
    assert.deepEqual(await itemNames(listId), []);
  });

  it("show no editing controls to other members", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    await addItem(sam, listId, { name: "Book" });
    const page = await alex.get(`/wishlists/lists/${listId}/`);

    assert.match(page.text, /<title>Sam&#39;s list: Birthday - tink<\/title>/);
    for (const control of ["items/new/", "/edit/", "move-up", "move-down", "/delete/", "Archive"]) {
      assert.ok(!page.text.includes(control), control);
    }
  });

  it("escape member text, never rendering it as HTML", async () => {
    const listId = await createList(sam, { title: "<b>Bold</b>" });
    await addItem(sam, listId, { name: "<img src=x onerror=alert(1)>", notes: "<script>alert(1)</script>" });
    const page = await alex.get(`/wishlists/lists/${listId}/`);

    assert.ok(!page.text.includes("<img src=x"));
    assert.ok(!page.text.includes("<script>alert(1)"));
    assert.ok(page.text.includes("&lt;b&gt;Bold&lt;/b&gt;"));
  });
});

describe("changing IDs or form fields", () => {
  it("doesn't let a member add, edit, move or delete items on someone else's list", async () => {
    const listId = await createList(sam, { title: "Birthday" });
    const itemId = await addItem(sam, listId, { name: "Book" });
    const base = `/wishlists/lists/${listId}/items`;

    for (const path of [`${base}/new/`, `${base}/${itemId}/edit/`, `${base}/${itemId}/delete/`]) {
      assert.equal((await alex.get(path)).status, 404, path);
    }

    await alex.get("/wishlists/account/");
    for (const path of [`${base}/new/`, `${base}/${itemId}/edit/`, `${base}/${itemId}/move-up/`, `${base}/${itemId}/delete/`]) {
      assert.equal((await alex.post(path, { name: "Hacked", quantity: "1" })).status, 404, path);
    }

    assert.deepEqual(await itemNames(listId), ["Book"]);
  });

  it("doesn't let an item be reached through another list's address", async () => {
    const samList = await createList(sam, { title: "Sam's list" });
    const samItem = await addItem(sam, samList, { name: "Book" });
    const alexList = await createList(alex, { title: "Alex's list" });

    assert.equal((await alex.get(`/wishlists/lists/${alexList}/items/${samItem}/edit/`)).status, 404);
    await alex.get("/wishlists/account/");
    assert.equal((await alex.post(`/wishlists/lists/${alexList}/items/${samItem}/delete/`)).status, 404);
    assert.equal((await alex.post(`/wishlists/lists/${alexList}/items/${samItem}/edit/`, { name: "Hacked" })).status, 404);
    assert.deepEqual(await itemNames(samList), ["Book"]);
  });

  it("ignores an owner_id or list_id sent in the form", async () => {
    const alexList = await createList(alex, { title: "Alex's list" });
    await sam.get("/wishlists/mine/new/");
    await sam.post("/wishlists/mine/new/", { list_id: alexList, owner_id: "nope", title: "Mine", owner: "alex" });

    assert.equal((await app.db.one("SELECT owner_id FROM lists WHERE title = 'Mine'")).owner_id, samId);
  });

  it("treats a list that doesn't exist as not found", async () => {
    assert.equal((await sam.get("/wishlists/lists/00000000-0000-4000-8000-000000000000/")).status, 404);
    assert.equal((await sam.get("/wishlists/people/00000000-0000-4000-8000-000000000000/")).status, 404);
  });
});
