import { UUID_PATTERN } from "../security.mjs";
import * as account from "./account.mjs";
import * as admin from "./admin.mjs";
import * as invite from "./invite.mjs";
import * as lists from "./lists.mjs";
import * as logIn from "./log-in.mjs";
import * as pages from "./pages.mjs";
import * as reservations from "./reservations.mjs";

const ID = `(?<id>${UUID_PATTERN})`;
const LIST = `/lists/(?<listId>${UUID_PATTERN})`;
const ITEM = `${LIST}/items/(?<itemId>${UUID_PATTERN})`;

// access: "public" (anyone), "member" (logged in) or "admin"
function route(method, path, access, handler) {
  return { access, handler, method, pattern: new RegExp(`^/wishlists${path}$`) };
}

export const routes = [
  route("GET", "/", "member", lists.showEveryone),
  route("GET", "/help/", "public", pages.showHelp),

  route("GET", `/people/${ID}/`, "member", lists.showPerson),
  route("GET", "/mine/", "member", lists.showMine),
  route("GET", "/mine/new/", "member", lists.showNewList),
  route("POST", "/mine/new/", "member", lists.createListAction),
  route("GET", `${LIST}/`, "member", lists.showList),
  route("GET", `${LIST}/edit/`, "member", lists.showEditList),
  route("POST", `${LIST}/edit/`, "member", lists.editListAction),
  route("POST", `${LIST}/archive/`, "member", lists.archiveList),
  route("POST", `${LIST}/unarchive/`, "member", lists.unarchiveList),
  route("GET", `${LIST}/delete/`, "member", lists.showDeleteList),
  route("POST", `${LIST}/delete/`, "member", lists.deleteListAction),
  route("GET", `${LIST}/items/new/`, "member", lists.showNewItem),
  route("POST", `${LIST}/items/new/`, "member", lists.createItemAction),
  route("GET", `${ITEM}/edit/`, "member", lists.showEditItem),
  route("POST", `${ITEM}/edit/`, "member", lists.editItemAction),
  route("POST", `${ITEM}/move-up/`, "member", lists.moveItemUp),
  route("POST", `${ITEM}/move-down/`, "member", lists.moveItemDown),
  route("GET", `${ITEM}/delete/`, "member", lists.showDeleteItem),
  route("POST", `${ITEM}/delete/`, "member", lists.deleteItemAction),
  route("POST", `${ITEM}/reserve/`, "member", reservations.reserveAction),

  route("GET", "/reservations/", "member", (ctx) => reservations.showReservations(ctx)),
  route("POST", `/reservations/${ID}/bought/`, "member", reservations.markBought),
  route("POST", `/reservations/${ID}/reserved/`, "member", reservations.markReserved),
  route("POST", `/reservations/${ID}/cancel/`, "member", reservations.cancelReservation),
  route("POST", `/reservations/${ID}/quantity/`, "member", reservations.changeReservationQuantity),
  route("POST", `/reservations/${ID}/seen/`, "member", reservations.markChangesSeen),

  route("GET", "/log-in/", "public", logIn.showLogIn),
  route("POST", "/log-in/", "public", logIn.requestLogIn),
  route("GET", "/log-in/code/", "public", logIn.showCode),
  route("POST", "/log-in/code/", "public", logIn.enterCode),
  route("GET", "/log-in/link/", "public", logIn.showLink),
  route("POST", "/log-in/link/", "public", logIn.useLink),
  route("GET", "/invite/", "public", invite.showInvitation),
  route("POST", "/invite/", "public", invite.acceptInvitation),
  route("POST", "/log-out/", "member", account.logOut),

  route("GET", "/account/", "member", account.showAccount),
  route("POST", "/account/", "member", account.updateProfile),
  route("POST", `/account/sessions/${ID}/log-out/`, "member", account.logOutSession),
  route("POST", "/account/log-out-everywhere/", "member", account.logOutEverywhere),
  route("GET", "/account/delete/", "member", account.showDeleteAccount),
  route("POST", "/account/delete/", "member", account.deleteAccount),

  route("GET", "/admin/members/", "admin", admin.showMembers),
  route("POST", "/admin/members/invite/", "admin", admin.invite),
  route("POST", `/admin/invitations/${ID}/resend/`, "admin", admin.resendInvitation),
  route("POST", `/admin/invitations/${ID}/revoke/`, "admin", admin.revokeInvitation),
  route("GET", `/admin/members/${ID}/`, "admin", admin.showEditMember),
  route("POST", `/admin/members/${ID}/`, "admin", admin.editMember),
  route("POST", `/admin/members/${ID}/suspend/`, "admin", admin.suspendMember),
  route("POST", `/admin/members/${ID}/reinstate/`, "admin", admin.reinstateMember),
  route("POST", `/admin/members/${ID}/log-out/`, "admin", admin.revokeMemberSessions),
  route("GET", `/admin/members/${ID}/remove/`, "admin", admin.showRemoveMember),
  route("POST", `/admin/members/${ID}/remove/`, "admin", admin.removeMemberAction)
];
