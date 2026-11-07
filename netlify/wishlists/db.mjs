// Thin wrapper over a pg pool. Inside a transaction, transaction() just reuses it.

export function createDb(pool) {
  return wrap(pool, async (fn) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const result = await fn(wrap(client));
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
}

function wrap(queryable, runTransaction) {
  const db = {
    async query(text, params = []) {
      const result = await queryable.query(text, params);
      return result.rows;
    },
    async one(text, params = []) {
      const rows = await db.query(text, params);
      return rows[0] || null;
    },
    transaction(fn) {
      return runTransaction ? runTransaction(fn) : fn(db);
    }
  };

  return db;
}
