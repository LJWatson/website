// Lists and items. Every visibility and ownership rule is in these queries, not the templates.
//
// The owner's view and other members' views read items from the items table only.
// Reservation data is added to other members' views by a separate query, so the queries
// behind the owner's view never touch reservations.

const LIST_COLUMNS = `l.id, l.owner_id, l.title, l.description, l.archived_at, l.created_at,
  to_char(l.occasion_date, 'YYYY-MM-DD') AS occasion_date,
  coalesce(l.occasion_date < current_date, false) AS occasion_passed,
  (SELECT count(*)::int FROM items i WHERE i.list_id = l.id) AS item_count`;

const LIST_ORDER = "l.occasion_date NULLS LAST, lower(l.title), l.created_at";

const ITEM_COLUMNS = "i.id, i.list_id, i.name, i.url, i.price, i.price_currency, i.quantity, i.most_wanted, i.similar_ok, i.notes, i.position, i.updated_at";

// Other members see a list only while it isn't archived and its owner isn't suspended
const VISIBLE_TO_OTHERS = "m.status = 'active' AND l.archived_at IS NULL";

export function getVisibleList(db, listId, viewerId) {
  return db.one(
    `SELECT ${LIST_COLUMNS}, m.display_name AS owner_name
     FROM lists l JOIN members m ON m.id = l.owner_id
     WHERE l.id = $1 AND (l.owner_id = $2 OR (${VISIBLE_TO_OTHERS}))`,
    [listId, viewerId]
  );
}

export function getOwnedList(db, listId, ownerId) {
  return db.one(
    `SELECT ${LIST_COLUMNS}, m.display_name AS owner_name
     FROM lists l JOIN members m ON m.id = l.owner_id
     WHERE l.id = $1 AND l.owner_id = $2`,
    [listId, ownerId]
  );
}

// The owner's own lists, including archived ones
export function getListsForOwner(db, ownerId) {
  return db.query(
    `SELECT ${LIST_COLUMNS} FROM lists l WHERE l.owner_id = $1
     ORDER BY l.archived_at IS NOT NULL, ${LIST_ORDER}`,
    [ownerId]
  );
}

export function getVisibleListsOf(db, ownerId) {
  return db.query(
    `SELECT ${LIST_COLUMNS} FROM lists l JOIN members m ON m.id = l.owner_id
     WHERE l.owner_id = $1 AND ${VISIBLE_TO_OTHERS} ORDER BY ${LIST_ORDER}`,
    [ownerId]
  );
}

// Every other active member, each with their visible lists
export async function getEveryonesLists(db, viewerId) {
  const [people, lists] = await Promise.all([
    db.query(
      "SELECT id, display_name FROM members WHERE status = 'active' AND id <> $1 ORDER BY lower(display_name)",
      [viewerId]
    ),
    db.query(
      `SELECT ${LIST_COLUMNS} FROM lists l JOIN members m ON m.id = l.owner_id
       WHERE l.owner_id <> $1 AND ${VISIBLE_TO_OTHERS} ORDER BY ${LIST_ORDER}`,
      [viewerId]
    )
  ]);

  return people.map((person) => ({ ...person, lists: lists.filter((list) => list.owner_id === person.id) }));
}

export function getActiveMember(db, memberId) {
  return db.one("SELECT id, display_name FROM members WHERE id = $1 AND status = 'active'", [memberId]);
}

export function getItems(db, listId) {
  return db.query(`SELECT ${ITEM_COLUMNS} FROM items i WHERE i.list_id = $1 ORDER BY i.position`, [listId]);
}

// The item, only if it's on that list and the list belongs to ownerId
export function getOwnedItem(db, listId, itemId, ownerId) {
  return db.one(
    `SELECT ${ITEM_COLUMNS} FROM items i JOIN lists l ON l.id = i.list_id
     WHERE i.id = $1 AND i.list_id = $2 AND l.owner_id = $3`,
    [itemId, listId, ownerId]
  );
}

export async function createList(db, ownerId, list) {
  const row = await db.one(
    "INSERT INTO lists (owner_id, title, description, occasion_date) VALUES ($1, $2, $3, $4) RETURNING id",
    [ownerId, list.title, list.description || null, list.occasionDate || null]
  );

  return row.id;
}

export async function updateList(db, listId, list) {
  await db.query(
    "UPDATE lists SET title = $2, description = $3, occasion_date = $4, updated_at = now() WHERE id = $1",
    [listId, list.title, list.description || null, list.occasionDate || null]
  );
}

export async function setArchived(db, listId, archived) {
  await db.query(
    `UPDATE lists SET archived_at = ${archived ? "coalesce(archived_at, now())" : "NULL"}, updated_at = now() WHERE id = $1`,
    [listId]
  );
}

// Deleting the list deletes its items. The reservations phase keeps reservations on them.
export async function deleteList(db, listId) {
  await db.query("DELETE FROM lists WHERE id = $1", [listId]);
}

export function createItem(db, listId, item) {
  return db.transaction(async (tx) => {
    // Lock the list so two items added at once don't get the same position
    await tx.query("SELECT id FROM lists WHERE id = $1 FOR UPDATE", [listId]);

    const row = await tx.one(
      `INSERT INTO items (list_id, name, url, price, price_currency, quantity, most_wanted, similar_ok, notes, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, (SELECT coalesce(max(position), 0) + 1 FROM items WHERE list_id = $1))
       RETURNING id`,
      [listId, item.name, item.url || null, item.price, item.currency, item.quantity, item.mostWanted, item.similarOk, item.notes || null]
    );

    return row.id;
  });
}

// updated_at only moves when something actually changed
export async function updateItem(db, itemId, item) {
  await db.query(
    `UPDATE items SET name = $2, url = $3, price = $4, price_currency = $5, quantity = $6, most_wanted = $7, similar_ok = $8, notes = $9,
     updated_at = CASE WHEN (name, url, price, price_currency, quantity, most_wanted, similar_ok, notes)
       IS DISTINCT FROM ($2, $3, $4::numeric, $5, $6::int, $7::boolean, $8::boolean, $9) THEN now() ELSE updated_at END
     WHERE id = $1`,
    [itemId, item.name, item.url || null, item.price, item.currency, item.quantity, item.mostWanted, item.similarOk, item.notes || null]
  );
}

// Swaps the item with its neighbour. Returns its new place, counting from 1, or null if it
// was already first (moving up) or last (moving down).
export function moveItem(db, listId, itemId, direction) {
  return db.transaction(async (tx) => {
    await tx.query("SELECT id FROM lists WHERE id = $1 FOR UPDATE", [listId]);

    const items = await tx.query("SELECT id, position FROM items WHERE list_id = $1 ORDER BY position", [listId]);
    const index = items.findIndex((item) => item.id === itemId);
    const otherIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || otherIndex < 0 || otherIndex >= items.length) {
      return null;
    }

    const item = items[index];
    const other = items[otherIndex];

    await tx.query("UPDATE items SET position = $2 WHERE id = $1", [item.id, other.position]);
    await tx.query("UPDATE items SET position = $2 WHERE id = $1", [other.id, item.position]);

    return { place: otherIndex + 1, total: items.length };
  });
}

// The reservations phase keeps reservations on deleted items
export async function deleteItem(db, itemId) {
  await db.query("DELETE FROM items WHERE id = $1", [itemId]);
}
