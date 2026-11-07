// Reservations. Nothing here is ever used to build a page for a list's owner: the owner's
// view of a list comes from lists.mjs alone, which never reads this table.

export class ReservationError extends Error {}

// Reservations on the items of a list, for a member who isn't its owner
export async function getReservationsForGiver(db, list, viewerId) {
  if (list.owner_id === viewerId) {
    throw new Error("Reservations must never be read for a list's owner");
  }

  // Whether a reservation is bought, and when its reserver last looked, are only read back
  // for the viewer's own reservations
  const rows = await db.query(
    `SELECT r.id, r.item_id, r.reserver_id, r.quantity, m.display_name AS reserver_name,
       CASE WHEN r.reserver_id = $2 THEN r.status END AS status,
       CASE WHEN r.reserver_id = $2 THEN r.item_seen_at END AS item_seen_at
     FROM reservations r
     JOIN items i ON i.id = r.item_id
     JOIN members m ON m.id = r.reserver_id
     WHERE i.list_id = $1
     ORDER BY r.created_at`,
    [list.id, viewerId]
  );

  const byItem = new Map();

  for (const row of rows) {
    const entry = byItem.get(row.item_id) || [];
    entry.push({ ...row, mine: row.reserver_id === viewerId });
    byItem.set(row.item_id, entry);
  }

  return byItem;
}

// Status text for other members: "Reserved by Sam", "Reserved by you (2); 1 still available".
// Whether someone has bought it is private to them, so it's never part of this.
export function describeItemForGiver(item, reservations = []) {
  const reserved = reservations.reduce((total, reservation) => total + reservation.quantity, 0);
  const remaining = Math.max(0, item.quantity - reserved);
  const mine = reservations.find((reservation) => reservation.mine) || null;
  const parts = reservations.map((reservation) => {
    const who = reservation.mine ? "you" : reservation.reserver_name;
    const count = item.quantity > 1 ? ` (${reservation.quantity})` : "";
    return `Reserved by ${who}${count}`;
  });

  let status = parts.length ? parts.join("; ") : "Available";

  if (parts.length && remaining > 0) {
    status += `; ${remaining} still available`;
  } else if (!parts.length && item.quantity > 1) {
    status += `: ${item.quantity} wanted`;
  }

  return {
    changed: Boolean(mine && new Date(item.updated_at) > new Date(mine.item_seen_at)),
    mine,
    remaining,
    status
  };
}

// The item, locked, with how many are reserved by others and by the reserver.
// Locking the item row makes reservations of the same item take turns, so the first wins.
async function lockItemForReserver(db, itemId, reserverId) {
  const item = await db.one(
    `SELECT i.id, i.name, i.url, i.quantity, i.updated_at, l.id AS list_id, l.title AS list_title, l.owner_id,
       m.display_name AS owner_name
     FROM items i JOIN lists l ON l.id = i.list_id JOIN members m ON m.id = l.owner_id
     WHERE i.id = $1 AND m.status = 'active' AND l.archived_at IS NULL
     FOR UPDATE OF i`,
    [itemId]
  );

  if (!item) {
    return null;
  }

  const totals = await db.one(
    `SELECT coalesce(sum(quantity) FILTER (WHERE reserver_id <> $2), 0)::int AS others,
       coalesce(sum(quantity) FILTER (WHERE reserver_id = $2), 0)::int AS mine
     FROM reservations WHERE item_id = $1`,
    [itemId, reserverId]
  );

  return { ...item, available: Math.max(0, item.quantity - totals.others), mine: totals.mine };
}

function remainingMessage(item, available) {
  if (available <= 0) {
    return `Someone else has just reserved ${item.name}, so there's none left to reserve.`;
  }

  return `Only ${available} of ${item.name} ${available === 1 ? "is" : "are"} still available. Someone else may have just reserved some.`;
}

// Reserves more of an item, adding to the member's reservation if they already have one
export function reserve(db, { itemId, listId, quantity, reserverId }) {
  return db.transaction(async (tx) => {
    const item = await lockItemForReserver(tx, itemId, reserverId);

    if (!item || item.list_id !== listId) {
      throw new ReservationError("That item isn't on the list any more.");
    }

    if (item.owner_id === reserverId) {
      throw new ReservationError("You can't reserve items on your own lists.");
    }

    const total = item.mine + quantity;

    if (total > item.available) {
      throw new ReservationError(remainingMessage(item, item.available - item.mine));
    }

    const snapshot = {
      list_id: item.list_id,
      list_title: item.list_title,
      name: item.name,
      owner_id: item.owner_id,
      owner_name: item.owner_name,
      url: item.url
    };

    await tx.query(
      `INSERT INTO reservations (item_id, reserver_id, quantity, item_snapshot, item_seen_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (item_id, reserver_id) WHERE item_id IS NOT NULL
       DO UPDATE SET quantity = $3, updated_at = now()`,
      [itemId, reserverId, total, JSON.stringify(snapshot), item.updated_at]
    );

    return { name: item.name, quantity: total };
  });
}

// The member's own reservation, with its item if the item still exists
export function getOwnReservation(db, reservationId, reserverId) {
  return db.one(
    `SELECT r.id, r.item_id, r.quantity, r.status, r.item_snapshot, i.list_id, i.updated_at AS item_updated_at,
       coalesce(i.name, r.item_snapshot->>'name') AS name
     FROM reservations r LEFT JOIN items i ON i.id = r.item_id
     WHERE r.id = $1 AND r.reserver_id = $2`,
    [reservationId, reserverId]
  );
}

export async function setStatus(db, reservationId, status) {
  await db.query("UPDATE reservations SET status = $2, updated_at = now() WHERE id = $1", [reservationId, status]);
}

export function changeQuantity(db, reservation, reserverId, quantity) {
  return db.transaction(async (tx) => {
    const item = await lockItemForReserver(tx, reservation.item_id, reserverId);

    if (!item) {
      throw new ReservationError("That item isn't on the list any more.");
    }

    if (quantity > item.available) {
      throw new ReservationError(remainingMessage(item, item.available));
    }

    await tx.query("UPDATE reservations SET quantity = $2, updated_at = now() WHERE id = $1", [reservation.id, quantity]);
  });
}

export async function markSeen(db, reservationId) {
  await db.query(
    "UPDATE reservations r SET item_seen_at = i.updated_at FROM items i WHERE r.id = $1 AND i.id = r.item_id",
    [reservationId]
  );
}

export async function cancel(db, reservationId) {
  await db.query("DELETE FROM reservations WHERE id = $1", [reservationId]);
}

// Everything the member has reserved, grouped by the person it's for
export async function getShoppingList(db, reserverId) {
  const rows = await db.query(
    `SELECT r.id, r.item_id, r.quantity, r.status, r.item_snapshot, r.item_seen_at,
       i.name, i.url, i.quantity AS item_quantity, i.updated_at AS item_updated_at, i.position,
       l.id AS list_id, l.title AS list_title, l.owner_id, o.display_name AS owner_name,
       coalesce(o.status = 'active' AND l.archived_at IS NULL, false) AS list_visible,
       (SELECT coalesce(sum(r2.quantity), 0)::int FROM reservations r2 WHERE r2.item_id = r.item_id AND r2.id <> r.id) AS reserved_by_others
     FROM reservations r
     LEFT JOIN items i ON i.id = r.item_id
     LEFT JOIN lists l ON l.id = i.list_id
     LEFT JOIN members o ON o.id = l.owner_id
     WHERE r.reserver_id = $1`,
    [reserverId]
  );

  const groups = new Map();

  for (const row of rows) {
    const snapshot = row.item_snapshot || {};
    const removed = !row.item_id;
    const ownerId = removed ? snapshot.owner_id : row.owner_id;
    const entry = {
      ...row,
      changed: !removed && new Date(row.item_updated_at) > new Date(row.item_seen_at),
      list_title: removed ? snapshot.list_title : row.list_title,
      max_quantity: removed ? row.quantity : Math.max(row.quantity, row.item_quantity - row.reserved_by_others),
      name: removed ? snapshot.name : row.name,
      owner_name: removed ? snapshot.owner_name : row.owner_name,
      removed,
      url: removed ? snapshot.url : row.url
    };
    const group = groups.get(ownerId) || { items: [], owner_name: entry.owner_name };
    group.items.push(entry);
    groups.set(ownerId, group);
  }

  const byName = (a, b) => String(a).localeCompare(String(b), "en-GB", { sensitivity: "base" });

  return [...groups.values()]
    .sort((a, b) => byName(a.owner_name, b.owner_name))
    .map((group) => {
      const items = group.items.sort((a, b) => byName(a.list_title, b.list_title) || (a.position ?? 0) - (b.position ?? 0) || byName(a.name, b.name));

      // Each person's items, split into what's still to buy and what's been bought
      return {
        ...group,
        bought: items.filter((item) => item.status === "bought"),
        items,
        toBuy: items.filter((item) => item.status !== "bought")
      };
    });
}
