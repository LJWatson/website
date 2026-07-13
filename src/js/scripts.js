const labelSearchInput = (attempts = 0) => {
const input = document.querySelector(".pf-searchbox-input");
if (input) { input.setAttribute("aria-label", "Search"); return; }
if (attempts < 20) setTimeout(() => labelSearchInput(attempts + 1), 100);
};
labelSearchInput();

(() => {
const menus = document.querySelectorAll("[data-navigation-menu]");

if (menus.length === 0) {
return;
}

menus.forEach((menu) => {
const closeButton = menu.querySelector("[data-navigation-menu-close]");
const dialog = menu.querySelector("[data-navigation-menu-dialog]");
const firstLink = menu.querySelector("[data-navigation-menu-first-link]");
const toggle = menu.querySelector("[data-navigation-menu-toggle]");

if (!closeButton || !dialog || !toggle) {
return;
}

function setExpanded(isExpanded) {
toggle.setAttribute("aria-expanded", String(isExpanded));
}

function focusToggle() {
window.requestAnimationFrame(() => {
toggle.focus();
});
}

function openMenu() {
if (dialog.open) {
return;
}

if (typeof dialog.showModal === "function") {
dialog.showModal();
} else {
dialog.setAttribute("open", "");
}

setExpanded(true);
window.requestAnimationFrame(() => {
(firstLink || closeButton).focus();
});
}

function closeMenu() {
if (!dialog.open) {
return;
}

if (typeof dialog.close === "function") {
dialog.close();
} else {
dialog.removeAttribute("open");
}

setExpanded(false);
focusToggle();
}

toggle.addEventListener("click", () => {
if (dialog.open) {
closeMenu();
return;
}

openMenu();
});

closeButton.addEventListener("click", closeMenu);

dialog.addEventListener("cancel", () => {
setExpanded(false);
focusToggle();
});

dialog.addEventListener("close", () => {
setExpanded(false);
});

dialog.addEventListener("click", (event) => {
const { bottom, left, right, top } = dialog.getBoundingClientRect();
const clickedBackdrop = event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom;

if (!clickedBackdrop) {
return;
}

closeMenu();
});
});
})();
