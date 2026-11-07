const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DISPLAY_NAME_MAX = 60;

export function normaliseEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function normaliseText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

// Returns an error message, or null when the address is usable
export function checkEmail(email, emptyMessage) {
  if (!email) {
    return emptyMessage;
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return "Enter an email address in the correct format, like name@example.com";
  }

  return null;
}

export function checkDisplayName(name) {
  if (!name) {
    return "Enter a display name";
  }

  if ([...name].length > DISPLAY_NAME_MAX) {
    return `Display name must be ${DISPLAY_NAME_MAX} characters or fewer`;
  }

  return null;
}

// Keeps line breaks, as notes and descriptions are shown with them
export function normaliseMultiline(value) {
  return String(value || "").replace(/\r\n?/g, "\n").trim();
}

export function checkLength(value, max, message) {
  return [...value].length > max ? message : null;
}

export const LIST_TITLE_MAX = 100;
export const LIST_DESCRIPTION_MAX = 1000;
export const ITEM_NAME_MAX = 200;
// The order they appear in the dropdown. The first is the default.
export const CURRENCIES = [
  { code: "GBP", symbol: "£" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" }
];
export const ITEM_NOTES_MAX = 1000;
export const ITEM_URL_MAX = 2000;
export const QUANTITY_MAX = 99;

// An optional YYYY-MM-DD date, as sent by <input type="date">
export function checkDate(value) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = match && new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));

  if (!date || date.toISOString().slice(0, 10) !== value || date.getUTCFullYear() < 2000 || date.getUTCFullYear() > 2100) {
    return "Enter a real date, like 25 December 2026, or leave it empty";
  }

  return null;
}

// Only https: links, which also rules out javascript: and data:
export function checkItemUrl(value) {
  if (!value) {
    return null;
  }

  if (value.length > ITEM_URL_MAX) {
    return `The link must be ${ITEM_URL_MAX.toLocaleString("en-GB")} characters or fewer`;
  }

  try {
    const url = new URL(value);

    if (url.protocol === "https:" && url.hostname) {
      return null;
    }
  } catch {
    // Falls through to the message below
  }

  return "Enter a link that starts with https://, or leave it empty";
}

// An optional amount, such as 30 or 29.99. Returns { price, error }, with price as a string or null.
export function parsePrice(value) {
  const text = String(value || "").trim();

  if (!text) {
    return { error: null, price: null };
  }

  if (!/^\d{1,8}(\.\d{1,2})?$/.test(text)) {
    return { error: "Enter the price as a number, like 30 or 29.99, or leave it empty", price: null };
  }

  return { error: null, price: text };
}

export function parseCurrency(value) {
  const known = CURRENCIES.find((currency) => currency.code === value);
  return known ? known.code : CURRENCIES[0].code;
}

// Empty means 1. Returns { quantity, error }.
export function parseQuantity(value) {
  const text = String(value || "").trim();

  if (!text) {
    return { error: null, quantity: 1 };
  }

  const quantity = Number(text);

  if (!/^\d+$/.test(text) || quantity < 1 || quantity > QUANTITY_MAX) {
    return { error: `Enter a whole number from 1 to ${QUANTITY_MAX}`, quantity: null };
  }

  return { error: null, quantity };
}

// Collects field errors in page order, for the error summary and the inline messages
export class FormErrors {
  constructor() {
    this.list = [];
    this.byField = {};
  }

  add(field, message) {
    if (message && !this.byField[field]) {
      this.list.push({ field, message });
      this.byField[field] = message;
    }

    return this;
  }

  get any() {
    return this.list.length > 0;
  }
}
