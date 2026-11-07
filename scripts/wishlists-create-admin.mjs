#!/usr/bin/env node

// Creates the one admin member, which the app itself can't do.
//
//   NETLIFY_DB_URL="<connection string>" node scripts/wishlists-create-admin.mjs you@example.com "Your name"
//
// For production, get the connection string with: netlify database connect --json

import { getDatabase } from "@netlify/database";

const [email, displayName] = process.argv.slice(2);
const connectionString = process.env.NETLIFY_DB_URL;

if (!email || !displayName || !connectionString) {
  console.error("Usage: NETLIFY_DB_URL=<connection string> node scripts/wishlists-create-admin.mjs <email> <display name>");
  process.exit(1);
}

const { pool } = getDatabase({ connectionString });

try {
  const existing = await pool.query("SELECT email FROM members WHERE role = 'admin'");

  if (existing.rows.length > 0) {
    console.error(`There's already an admin member: ${existing.rows[0].email}`);
    process.exitCode = 1;
  } else {
    await pool.query(
      `INSERT INTO members (email, display_name, role) VALUES ($1, $2, 'admin')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', status = 'active'`,
      [email.trim().toLowerCase(), displayName.trim()]
    );
    console.log(`${email} is now the admin member.`);
  }
} finally {
  await pool.end();
}
