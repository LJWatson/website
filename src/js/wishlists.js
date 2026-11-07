// Wishlists: opens delete confirmations as a modal dialog instead of going to the
// confirmation page. Without JavaScript, or without <dialog> support, the link still works.
(() => {
if (typeof HTMLDialogElement !== "function") {
return;
}

document.addEventListener("click", (event) => {
const link = event.target.closest("a[data-dialog]");

// Leave new-tab and new-window clicks alone
if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
const dialog = document.getElementById(link.dataset.dialog);

if (dialog && typeof dialog.showModal === "function") {
event.preventDefault();
// Focus goes to the dialog's Keep button, and back to the link when it closes
dialog.showModal();
}

return;
}

const closeButton = event.target.closest("[data-close-dialog]");

if (closeButton) {
closeButton.closest("dialog").close();
}
});
})();

// Wishlists: item actions update in place. Reserving, marking as bought, cancelling,
// changing how many, marking changes as seen, and moving items send their form in the
// background. The server replies as it would without JavaScript, by redirecting to the
// updated page. The matching part of that page replaces the old one, focus stays with the
// item, and the confirmation or error is announced in a polite live region.
// Without JavaScript, the same forms reload the page with the message at the top.
(() => {
const announcer = document.querySelector("[data-live-announcer]");

if (!announcer || !window.fetch || !window.DOMParser) {
return;
}

let busy = false;

function announce(message) {
announcer.textContent = "";

// Clearing first, then waiting, means the same message twice in a row is still announced
window.setTimeout(() => {
announcer.textContent = message;
}, 100);
}

function focusOn(element) {
if (!element.matches("a, button, input, select, textarea")) {
element.setAttribute("tabindex", "-1");
}

element.focus();
}

function formWithAction(container, action) {
return Array.from(container.querySelectorAll("form")).find((form) => form.getAttribute("action") === action);
}

// After the update: a field with an error, then the same button, then its opposite
// (Mark as bought and Mark as not bought, Move up and Move down), then the item's
// heading. If the item has gone, the heading of the item now in its place, or the page's h1.
function findFocus(container, action, blockId, blockIndex) {
const block = blockId ? document.getElementById(blockId) : null;

if (block && container.contains(block)) {
const invalid = block.querySelector("[aria-invalid='true']");

if (invalid) {
return invalid;
}

const opposites = [["/bought/", "/reserved/"], ["/reserved/", "/bought/"], ["/move-up/", "/move-down/"], ["/move-down/", "/move-up/"]];
const candidates = [action, ...opposites.filter(([from]) => action.endsWith(from)).map(([from, to]) => action.slice(0, -from.length) + to)];

for (const candidate of candidates) {
const form = formWithAction(block, candidate);

if (form) {
return form.querySelector("button[type='submit']");
}
}

return block.querySelector("h2, h3, h4");
}

const blocks = Array.from(container.querySelectorAll("[data-item-block]"));
const next = blocks[blockIndex] || blocks[blockIndex - 1];

return (next && next.querySelector("h2, h3, h4")) || document.querySelector("main h1");
}

function messageFrom(page) {
const errors = Array.from(page.querySelectorAll(".error-summary li")).map((item) => item.textContent.trim());

if (errors.length) {
return `Error: ${errors.join(" ")}`;
}

const status = page.querySelector(".wishlists-status p");
return status ? status.textContent.trim() : "";
}

document.addEventListener("submit", async (event) => {
const form = event.target.closest("form[data-enhance]");
const container = form && form.closest("[data-live-container]");

if (!container) {
return;
}

event.preventDefault();

if (busy) {
return;
}

busy = true;

const action = form.getAttribute("action");
const block = form.closest("[data-item-block]");
const blockIndex = Array.from(container.querySelectorAll("[data-item-block]")).indexOf(block);

try {
const response = await fetch(action, {
body: new URLSearchParams(new FormData(form)),
credentials: "same-origin",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
method: "POST"
});
const page = new DOMParser().parseFromString(await response.text(), "text/html");
const fresh = page.getElementById(container.id);

// Anything unexpected, such as being logged out: send the form the ordinary way
if (!fresh) {
form.submit();
return;
}

container.innerHTML = fresh.innerHTML;

const target = findFocus(container, action, block && block.id, blockIndex);

if (target) {
focusOn(target);
}

announce(messageFrom(page));
} catch {
form.submit();
} finally {
busy = false;
}
});
})();
