import { page } from "./common.mjs";

export function showHelp(ctx) {
  return page(ctx, "help.html", { title: "Help" });
}
