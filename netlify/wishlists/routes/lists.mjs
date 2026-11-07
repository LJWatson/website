import { audit } from "../audit.mjs";
import { redirect } from "../http.mjs";
import {
  createItem, createList, deleteItem, deleteList, getActiveMember, getEveryonesLists, getItems, getListsForOwner,
  getOwnedItem, getOwnedList, getVisibleList, getVisibleListsOf, moveItem, setArchived, updateItem, updateList
} from "../lists.mjs";
import { describeItemForGiver, getReservationsForGiver } from "../reservations.mjs";
import {
  checkDate, checkItemUrl, checkLength, CURRENCIES, FormErrors, ITEM_NAME_MAX, ITEM_NOTES_MAX, LIST_DESCRIPTION_MAX,
  LIST_TITLE_MAX, normaliseMultiline, normaliseText, parseCurrency, parsePrice, parseQuantity, QUANTITY_MAX
} from "../validation.mjs";
import { invalid, notFound, page } from "./common.mjs";

export function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

const listPath = (listId) => `/wishlists/lists/${listId}/`;

// Pages

export async function showEveryone(ctx) {
  return page(ctx, "everyone.html", { people: await getEveryonesLists(ctx.db, ctx.member.id), title: "Everyone's lists" });
}

export async function showPerson(ctx, { id }) {
  if (id === ctx.member.id) {
    return redirect("/wishlists/mine/");
  }

  const person = await getActiveMember(ctx.db, id);

  if (!person) {
    return notFound(ctx);
  }

  return page(ctx, "person.html", {
    lists: await getVisibleListsOf(ctx.db, id),
    person,
    title: `${person.display_name}'s lists`
  });
}

export async function showMine(ctx) {
  const lists = await getListsForOwner(ctx.db, ctx.member.id);

  return page(ctx, "mine.html", {
    archived: lists.filter((list) => list.archived_at),
    lists: lists.filter((list) => !list.archived_at),
    title: "My lists"
  });
}

export async function showList(ctx, { listId }) {
  const list = await getVisibleList(ctx.db, listId, ctx.member.id);

  if (!list) {
    return notFound(ctx);
  }

  return listPage(ctx, list);
}

// The owner's view is built from the items alone. Reservations are read only for other
// members, after the ownership check, so nothing about them can reach the owner.
export async function listPage(ctx, list, { errors = null, status = 200 } = {}) {
  const isOwner = list.owner_id === ctx.member.id;
  let items = await getItems(ctx.db, list.id);

  if (!isOwner) {
    const reservations = await getReservationsForGiver(ctx.db, list, ctx.member.id);
    items = items.map((item) => ({ ...item, giver: describeItemForGiver(item, reservations.get(item.id)) }));
  }

  return page(ctx, "list.html", {
    canDelete: isOwner || ctx.member.role === "admin",
    errors,
    isOwner,
    items,
    list,
    title: isOwner ? list.title : `${list.owner_name}'s list: ${list.title}`
  }, status);
}

// Lists

function readListForm(form) {
  const values = {
    description: normaliseMultiline(form.get("description")),
    occasion_date: String(form.get("occasion_date") || "").trim(),
    title: normaliseText(form.get("title"))
  };
  const errors = new FormErrors()
    .add("title", values.title ? checkLength(values.title, LIST_TITLE_MAX, `The title must be ${LIST_TITLE_MAX} characters or fewer`) : "Enter a title for the list")
    .add("occasion_date", checkDate(values.occasion_date))
    .add("description", checkLength(values.description, LIST_DESCRIPTION_MAX, `The description must be ${LIST_DESCRIPTION_MAX.toLocaleString("en-GB")} characters or fewer`));

  return {
    errors,
    list: { description: values.description, occasionDate: values.occasion_date, title: values.title },
    values
  };
}

export function showNewList(ctx) {
  return page(ctx, "list-form.html", { title: "Create a list", values: {} });
}

export async function createListAction(ctx) {
  const { errors, list, values } = readListForm(ctx.form);

  if (errors.any) {
    return invalid(ctx, "list-form.html", { errors, title: "Create a list", values });
  }

  const listId = await createList(ctx.db, ctx.member.id, list);
  ctx.setFlash(`${list.title} is ready. Add the first item.`);
  return redirect(listPath(listId));
}

export async function showEditList(ctx, { listId }) {
  const list = await getOwnedList(ctx.db, listId, ctx.member.id);

  if (!list) {
    return notFound(ctx);
  }

  return page(ctx, "list-form.html", { list, title: `Edit ${list.title}`, values: list });
}

export async function editListAction(ctx, { listId }) {
  const existing = await getOwnedList(ctx.db, listId, ctx.member.id);

  if (!existing) {
    return notFound(ctx);
  }

  const { errors, list, values } = readListForm(ctx.form);

  if (errors.any) {
    return invalid(ctx, "list-form.html", { errors, list: existing, title: `Edit ${existing.title}`, values });
  }

  await updateList(ctx.db, listId, list);
  ctx.setFlash("Your changes to the list are saved.");
  return redirect(listPath(listId));
}

export async function archiveList(ctx, { listId }) {
  const list = await getOwnedList(ctx.db, listId, ctx.member.id);

  if (!list) {
    return notFound(ctx);
  }

  await setArchived(ctx.db, listId, true);
  ctx.setFlash(`${list.title} is hidden from other members. You can unarchive it at any time.`);
  return redirect(listPath(listId));
}

export async function unarchiveList(ctx, { listId }) {
  const list = await getOwnedList(ctx.db, listId, ctx.member.id);

  if (!list) {
    return notFound(ctx);
  }

  await setArchived(ctx.db, listId, false);
  ctx.setFlash(`Other members can see ${list.title} again.`);
  return redirect(listPath(listId));
}

// The owner can delete their own lists, and the admin can delete any list they can see
async function getDeletableList(ctx, listId) {
  const list = await getVisibleList(ctx.db, listId, ctx.member.id);
  const allowed = list && (list.owner_id === ctx.member.id || ctx.member.role === "admin");

  return allowed ? list : null;
}

export async function showDeleteList(ctx, { listId }) {
  const list = await getDeletableList(ctx, listId);

  if (!list) {
    return notFound(ctx);
  }

  return page(ctx, "list-delete.html", { isOwner: list.owner_id === ctx.member.id, list, title: `Delete ${list.title}` });
}

// The confirmation and the result are the same whether or not any items are reserved
export async function deleteListAction(ctx, { listId }) {
  const list = await getDeletableList(ctx, listId);

  if (!list) {
    return notFound(ctx);
  }

  const isOwner = list.owner_id === ctx.member.id;

  await ctx.db.transaction(async (db) => {
    await deleteList(db, listId);

    if (!isOwner) {
      await audit(db, ctx.member.id, "delete-list", list.owner_id, { title: list.title });
    }
  });

  ctx.setFlash(`${list.title} and its ${plural(list.item_count, "item")} are deleted.`);
  return redirect(isOwner ? "/wishlists/mine/" : `/wishlists/people/${list.owner_id}/`);
}

// Items

function readItemForm(form) {
  const values = {
    most_wanted: form.get("most_wanted") === "yes",
    name: normaliseText(form.get("name")),
    notes: normaliseMultiline(form.get("notes")),
    price: String(form.get("price") || "").trim(),
    price_currency: parseCurrency(form.get("price_currency")),
    quantity: String(form.get("quantity") || "").trim(),
    similar_ok: form.get("similar_ok") === "yes",
    url: String(form.get("url") || "").trim()
  };
  const { error: priceError, price } = parsePrice(values.price);
  const { error: quantityError, quantity } = parseQuantity(values.quantity);
  const errors = new FormErrors()
    .add("name", values.name ? checkLength(values.name, ITEM_NAME_MAX, `The name must be ${ITEM_NAME_MAX} characters or fewer`) : "Enter the item's name")
    .add("url", checkItemUrl(values.url))
    .add("price", priceError)
    .add("quantity", quantityError)
    .add("notes", checkLength(values.notes, ITEM_NOTES_MAX, `Notes must be ${ITEM_NOTES_MAX.toLocaleString("en-GB")} characters or fewer`));

  return {
    errors,
    item: {
      currency: values.price_currency,
      mostWanted: values.most_wanted,
      name: values.name,
      notes: values.notes,
      price,
      quantity,
      similarOk: values.similar_ok,
      url: values.url
    },
    values
  };
}

const CURRENCY_OPTIONS = CURRENCIES.map((currency) => ({ text: currency.symbol, value: currency.code }));
const itemFormData = (list, data) => ({ currencies: CURRENCY_OPTIONS, list, quantityMax: QUANTITY_MAX, ...data });

// Values for the edit form. Postgres gives the price as "30.00", which shows as 30.
function itemValues(item) {
  return { ...item, price: item.price === null ? "" : String(Number(item.price)), quantity: String(item.quantity) };
}

export async function showNewItem(ctx, { listId }) {
  const list = await getOwnedList(ctx.db, listId, ctx.member.id);

  if (!list) {
    return notFound(ctx);
  }

  return page(ctx, "item-form.html", itemFormData(list, { title: `Add an item to ${list.title}`, values: { price_currency: CURRENCIES[0].code, quantity: "1" } }));
}

export async function createItemAction(ctx, { listId }) {
  const list = await getOwnedList(ctx.db, listId, ctx.member.id);

  if (!list) {
    return notFound(ctx);
  }

  const { errors, item, values } = readItemForm(ctx.form);

  if (errors.any) {
    return invalid(ctx, "item-form.html", itemFormData(list, { errors, title: `Add an item to ${list.title}`, values }));
  }

  await createItem(ctx.db, listId, item);
  ctx.setFlash(`${item.name} is on the list.`);
  return redirect(listPath(listId));
}

export async function showEditItem(ctx, { listId, itemId }) {
  const list = await getOwnedList(ctx.db, listId, ctx.member.id);
  const item = list && await getOwnedItem(ctx.db, listId, itemId, ctx.member.id);

  if (!item) {
    return notFound(ctx);
  }

  return page(ctx, "item-form.html", itemFormData(list, { item, title: `Edit ${item.name}`, values: itemValues(item) }));
}

export async function editItemAction(ctx, { listId, itemId }) {
  const list = await getOwnedList(ctx.db, listId, ctx.member.id);
  const existing = list && await getOwnedItem(ctx.db, listId, itemId, ctx.member.id);

  if (!existing) {
    return notFound(ctx);
  }

  const { errors, item, values } = readItemForm(ctx.form);

  if (errors.any) {
    return invalid(ctx, "item-form.html", itemFormData(list, { errors, item: existing, title: `Edit ${existing.name}`, values }));
  }

  await updateItem(ctx.db, itemId, item);
  ctx.setFlash(`Your changes to ${item.name} are saved.`);
  return redirect(listPath(listId));
}

async function move(ctx, { listId, itemId }, direction) {
  const item = await getOwnedItem(ctx.db, listId, itemId, ctx.member.id);

  if (!item) {
    return notFound(ctx);
  }

  const moved = await moveItem(ctx.db, listId, itemId, direction);

  if (moved) {
    ctx.setFlash(`${item.name} is now number ${moved.place} of ${moved.total}.`);
  } else {
    ctx.setFlash(`${item.name} is already ${direction === "up" ? "first" : "last"}.`);
  }

  return redirect(listPath(listId));
}

export const moveItemUp = (ctx, params) => move(ctx, params, "up");
export const moveItemDown = (ctx, params) => move(ctx, params, "down");

export async function showDeleteItem(ctx, { listId, itemId }) {
  const list = await getOwnedList(ctx.db, listId, ctx.member.id);
  const item = list && await getOwnedItem(ctx.db, listId, itemId, ctx.member.id);

  if (!item) {
    return notFound(ctx);
  }

  return page(ctx, "item-delete.html", { item, list, title: `Delete ${item.name}` });
}

// The response is the same whether or not the item is reserved
export async function deleteItemAction(ctx, { listId, itemId }) {
  const item = await getOwnedItem(ctx.db, listId, itemId, ctx.member.id);

  if (!item) {
    return notFound(ctx);
  }

  await deleteItem(ctx.db, itemId);
  ctx.setFlash(`${item.name} is deleted.`);
  return redirect(listPath(listId));
}
