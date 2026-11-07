import { redirect } from "../http.mjs";
import { getVisibleList } from "../lists.mjs";
import {
  cancel, changeQuantity, getOwnReservation, getShoppingList, markSeen, reserve, ReservationError, setStatus
} from "../reservations.mjs";
import { FormErrors, parseQuantity } from "../validation.mjs";
import { notFound, page } from "./common.mjs";
import { listPage } from "./lists.mjs";

const RESERVATIONS_PATH = "/wishlists/reservations/";

export async function showReservations(ctx, { errors = null, status = 200 } = {}) {
  return page(ctx, "reservations.html", {
    errors,
    groups: await getShoppingList(ctx.db, ctx.member.id),
    title: "My reservations"
  }, status);
}

// Forms say which page they're on, so the result goes back there
function returnPath(ctx, listId) {
  return ctx.form.get("return_to") === "list" && listId ? `/wishlists/lists/${listId}/` : RESERVATIONS_PATH;
}

function countOf(quantity, name) {
  return quantity > 1 ? `${quantity} of ${name}` : name;
}

export async function reserveAction(ctx, { listId, itemId }) {
  const list = await getVisibleList(ctx.db, listId, ctx.member.id);

  if (!list) {
    return notFound(ctx);
  }

  // The same reply whatever the state of the owner's items
  if (list.owner_id === ctx.member.id) {
    return page(ctx, "error.html", { message: "You can't reserve items on your own lists.", title: "Not reserved" }, 403);
  }

  const { error, quantity } = parseQuantity(ctx.form.get("quantity"));
  const errors = new FormErrors();

  if (error) {
    errors.add(`item-${itemId}`, error);
    return listPage(ctx, list, { errors, status: 400 });
  }

  try {
    const reserved = await reserve(ctx.db, { itemId, listId, quantity, reserverId: ctx.member.id });
    ctx.setFlash(`You've reserved ${countOf(reserved.quantity, reserved.name)}. It's on My reservations.`);
  } catch (caught) {
    if (!(caught instanceof ReservationError)) {
      throw caught;
    }

    errors.add(`item-${itemId}`, caught.message);
    return listPage(ctx, list, { errors, status: 409 });
  }

  return redirect(returnPath(ctx, listId));
}

async function ownReservation(ctx, id) {
  return getOwnReservation(ctx.db, id, ctx.member.id);
}

export async function markBought(ctx, { id }) {
  const reservation = await ownReservation(ctx, id);

  if (!reservation) {
    return notFound(ctx);
  }

  await setStatus(ctx.db, id, "bought");
  ctx.setFlash(`${reservation.name} is ticked off as bought. Only you can see that.`);
  return redirect(returnPath(ctx, reservation.list_id));
}

export async function markReserved(ctx, { id }) {
  const reservation = await ownReservation(ctx, id);

  if (!reservation) {
    return notFound(ctx);
  }

  await setStatus(ctx.db, id, "reserved");
  ctx.setFlash(`${reservation.name} is back on your list of things to buy.`);
  return redirect(returnPath(ctx, reservation.list_id));
}

export async function cancelReservation(ctx, { id }) {
  const reservation = await ownReservation(ctx, id);

  if (!reservation) {
    return notFound(ctx);
  }

  await cancel(ctx.db, id);

  if (reservation.item_id) {
    ctx.setFlash(`You've cancelled your reservation of ${reservation.name}. Other members can reserve it now.`);
  } else {
    ctx.setFlash(`${reservation.name} is no longer on My reservations.`);
  }

  return redirect(returnPath(ctx, reservation.list_id));
}

export async function changeReservationQuantity(ctx, { id }) {
  const reservation = await ownReservation(ctx, id);

  if (!reservation || !reservation.item_id) {
    return notFound(ctx);
  }

  const onList = ctx.form.get("return_to") === "list";
  const errors = new FormErrors();
  const showError = async (message, status) => {
    if (onList) {
      const list = await getVisibleList(ctx.db, reservation.list_id, ctx.member.id);

      if (list) {
        errors.add(`item-${reservation.item_id}`, message);
        return listPage(ctx, list, { errors, status });
      }
    }

    errors.add(`reservation-${id}`, message);
    return showReservations(ctx, { errors, status });
  };

  const { error, quantity } = parseQuantity(ctx.form.get("quantity"));

  if (error) {
    return showError(error, 400);
  }

  try {
    await changeQuantity(ctx.db, reservation, ctx.member.id, quantity);
  } catch (caught) {
    if (!(caught instanceof ReservationError)) {
      throw caught;
    }

    return showError(caught.message, 409);
  }

  ctx.setFlash(`You've now reserved ${countOf(quantity, reservation.name)}.`);
  return redirect(returnPath(ctx, reservation.list_id));
}

export async function markChangesSeen(ctx, { id }) {
  const reservation = await ownReservation(ctx, id);

  if (!reservation || !reservation.item_id) {
    return notFound(ctx);
  }

  await markSeen(ctx.db, id);
  ctx.setFlash(`You've seen the changes to ${reservation.name}.`);
  return redirect(returnPath(ctx, reservation.list_id));
}
