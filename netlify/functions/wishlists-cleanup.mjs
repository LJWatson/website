import { getDatabase } from "@netlify/database";
import { purgeExpired } from "../wishlists/cleanup.mjs";
import { createDb } from "../wishlists/db.mjs";

export default async () => {
  await purgeExpired(createDb(getDatabase().pool));
};

export const config = {
  schedule: "@daily"
};
