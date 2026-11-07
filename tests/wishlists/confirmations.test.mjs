// Confirmations: never in the <title>, always in the page. And the hooks wishlists.js uses
// to update item actions in place, which the server's normal responses must keep providing.
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { addItem, Browser, createList, createMember, mainOf, reserveItem, startTestApp } from "./helpers.mjs";

let app;
let sam;
let alex;
let listId;
let scarfId;
let mugsId;

before(async () => {
  app = await startTestApp();
});

after(() => app.stop());

beforeEach(async () => {
  await app.reset();
  await createMember(app, { email: "sam@example.test", name: "Sam" });
  await createMember(app, { email: "alex@example.test", name: "Alex" });
  sam = await new Browser(app).logIn("sam@example.test");
  alex = await new Browser(app).logIn("alex@example.test");
  listId = await createList(sam, { title: "Christmas 2026" });
  scarfId = await addItem(sam, listId, { name: "Merino scarf" });
  mugsId = await addItem(sam, listId, { name: "Mugs", quantity: "4" });
});

const titleOf = (html) => html.match(/<title>([^<]*)<\/title>/)[1];

describe("confirmations", () => {
  it("appear at the top of the page and take focus, but never change the title", async () => {
    const reply = await reserveItem(alex, listId, scarfId);
    const page = await alex.get(reply.location);

    assert.equal(titleOf(page.text), "Sam&#39;s list: Christmas 2026 - tink");
    assert.match(mainOf(page.text), /<div class="wishlists-status" tabindex="-1" autofocus>\s*<p>You&#39;ve reserved Merino scarf/);

    await sam.get(`/wishlists/lists/${listId}/`);
    await sam.post(`/wishlists/lists/${listId}/items/${mugsId}/move-up/`);
    assert.equal(titleOf((await sam.get(`/wishlists/lists/${listId}/`)).text), "Christmas 2026 - tink");
  });

  it("still put Error: at the start of the title after a failed form", async () => {
    const reply = await reserveItem(alex, listId, mugsId, 9);
    assert.equal(titleOf(reply.text), "Error: Sam&#39;s list: Christmas 2026 - tink");
  });
});

describe("in-place updates", () => {
  it("have an empty polite live region on every page, ready for announcements", async () => {
    for (const path of ["/wishlists/", `/wishlists/lists/${listId}/`, "/wishlists/reservations/"]) {
      assert.match((await alex.get(path)).text, /<div data-live-announcer aria-live="polite" data-visibility="hidden"><\/div>/, path);
    }
  });

  it("find the items on a list in one container, each in its own block", async () => {
    const page = await alex.get(`/wishlists/lists/${listId}/`);

    assert.match(page.text, /<div class="wishlists-items" id="items" data-live-container>/);
    assert.match(page.text, new RegExp(`<div class="wishlists-item" id="item-${scarfId}" data-item-block>`));
    assert.match(page.text, new RegExp(`<form method="post" action="/wishlists/lists/${listId}/items/${scarfId}/reserve/" class="reserve-form" data-enhance>`));
  });

  it("cover reservation actions on lists and on My reservations, and moving items", async () => {
    await reserveItem(alex, listId, mugsId, 2);
    const id = (await app.db.one("SELECT id FROM reservations")).id;

    for (const path of [`/wishlists/lists/${listId}/`, "/wishlists/reservations/"]) {
      const page = await alex.get(path);

      for (const action of ["bought", "cancel", "quantity"]) {
        assert.match(page.text, new RegExp(`action="/wishlists/reservations/${id}/${action}/" class="(inline|reserve)-form" data-enhance>`), `${path} ${action}`);
      }
    }

    const reservations = await alex.get("/wishlists/reservations/");
    assert.match(reservations.text, /<div id="reservations" data-live-container>/);
    assert.match(reservations.text, new RegExp(`<div class="wishlists-item" id="reservation-${id}" data-item-block>\\s*<h4>Mugs</h4>`));
    assert.ok(!/<(ul|ol) class="wishlists-items"/.test(reservations.text));

    const ownerPage = await sam.get(`/wishlists/lists/${listId}/`);
    assert.match(ownerPage.text, new RegExp(`action="/wishlists/lists/${listId}/items/${mugsId}/move-up/" class="inline-form" data-enhance>`));
  });

  it("leave page-level and destructive forms to work the ordinary way", async () => {
    const page = await sam.get(`/wishlists/lists/${listId}/`);

    assert.match(page.text, /action="\/wishlists\/lists\/[^"]+\/archive\/" class="inline-form">/);
    assert.match(page.text, /action="\/wishlists\/lists\/[^"]+\/items\/[^"]+\/delete\/" class="inline-form">/);
  });

  it("get the updated container back when following the redirect, as the script does", async () => {
    // The script posts, follows the redirect, and reads the container from the page it gets
    const reply = await reserveItem(alex, listId, mugsId, 2);
    const page = await alex.get(reply.location);
    const container = page.text.slice(page.text.indexOf('id="items"'));

    assert.match(container, /Status:<\/strong> Reserved by you \(2\); 2 still available/);
    assert.match(page.text, /<div class="wishlists-status"[^>]*>\s*<p>You&#39;ve reserved 2 of Mugs/);
  });
});
