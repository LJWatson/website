// A real Postgres (PGlite) for the wishlists tests and local runner, with the migrations applied
import { NetlifyDB } from "@netlify/database-dev";
import pg from "pg";

export async function startLocalDatabase({ directory } = {}) {
  const server = new NetlifyDB({ directory, logger: () => {} });
  const connectionString = await server.start();
  await server.applyMigrations("netlify/database/migrations");

  // PGlite runs one session, so one connection keeps transactions from interleaving
  const pool = new pg.Pool({ connectionString, max: 1 });

  return {
    pool,
    async stop() {
      await pool.end();
      await server.stop();
    }
  };
}
