import { html } from "../http.mjs";
import { renderPage } from "../render.mjs";

export function page(ctx, template, data, status = 200) {
  return html(renderPage(ctx, template, data), status);
}

export function notFound(ctx) {
  return page(ctx, "not-found.html", { title: "Page not found" }, 404);
}

// Form errors re-render with a 400 status
export function invalid(ctx, template, data) {
  return page(ctx, template, data, 400);
}
