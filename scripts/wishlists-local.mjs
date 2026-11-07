#!/usr/bin/env node

// Runs the wishlists app locally without the Netlify CLI: a local Postgres with the
// migrations applied, the app at /wishlists/, and the built site (dist/) for everything else.
// Emails, with their log-in links and codes, are printed here instead of being sent.
//
//   npm run build
//   npm run wishlists:local -- --admin you@example.test --name "Your name"
//
// Data is kept in .wishlists-local/db between runs. Stop with Ctrl+C: killing the process
// can leave the database unreadable. --memory keeps nothing, so there's nothing to damage.
// --demo adds a member, Sam (sam@example.test), with a list to try reserving from.

import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { parseArgs } from "node:util";
import { createApp } from "../netlify/wishlists/app.mjs";
import { consoleTransport } from "../netlify/wishlists/email.mjs";
import { startLocalDatabase } from "./wishlists-local-db.mjs";

const { values: args } = parseArgs({
  options: {
    admin: { default: "admin@example.test", type: "string" },
    demo: { default: false, type: "boolean" },
    memory: { default: false, type: "boolean" },
    name: { default: "Admin", type: "string" },
    port: { default: "8888", type: "string" }
  }
});

const port = Number(args.port);
const distDir = path.resolve("dist");
const databaseDir = args.memory ? undefined : path.resolve(".wishlists-local/db");
let database;

try {
  database = await startLocalDatabase({ directory: databaseDir });
} catch (error) {
  console.error(`\nThe local database in ${databaseDir} couldn't be opened, probably because the runner was killed rather than stopped with Ctrl+C. Delete or rename that folder to start again with an empty database, or use --memory.\n`);
  throw error;
}

const admin = await database.pool.query("SELECT email FROM members WHERE role = 'admin'");

if (admin.rows.length === 0) {
  await database.pool.query("INSERT INTO members (email, display_name, role) VALUES ($1, $2, 'admin')", [args.admin.toLowerCase(), args.name]);
  console.log(`Created the admin member: ${args.admin}`);
} else {
  console.log(`Admin member: ${admin.rows[0].email}`);
}

if (args.demo) {
  await addDemoData(database.pool);
}

// Sam and a Christmas list, unless Sam is already there
async function addDemoData(pool) {
  const sam = await pool.query(
    "INSERT INTO members (email, display_name) VALUES ('sam@example.test', 'Sam') ON CONFLICT (email) DO NOTHING RETURNING id"
  );

  if (sam.rows.length === 0) {
    return;
  }

  const list = await pool.query(
    "INSERT INTO lists (owner_id, title, description, occasion_date) VALUES ($1, 'Christmas 2026', $2, '2026-12-25') RETURNING id",
    [sam.rows[0].id, "Thank you! Anything from here would be lovely."]
  );
  const items = [
    ["Merino scarf", "https://www.johnlewis.com/", "30", "GBP", 1, true, false, "Green or blue, please.\nNot red."],
    ["Coffee mugs", null, "12.50", "GBP", 4, false, true, "Any colour. Big ones."],
    ["Paperback by a favourite author", null, null, "GBP", 2, false, true, null],
    ["Board game", "https://www.example.com/", "45", "USD", 1, false, false, null],
    ["Walking socks", null, "15", "EUR", 3, false, true, "Size 6 to 8"]
  ];

  for (const [index, [name, url, price, currency, quantity, mostWanted, similarOk, notes]] of items.entries()) {
    await pool.query(
      `INSERT INTO items (list_id, name, url, price, price_currency, quantity, most_wanted, similar_ok, notes, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [list.rows[0].id, name, url, price, currency, quantity, mostWanted, similarOk, notes, index + 1]
    );
  }

  console.log("Added demo data: Sam (sam@example.test), with a list called Christmas 2026");
}

const handle = createApp({
  config: { baseUrl: `http://localhost:${port}`, emailFrom: "\"Wishlists\" <wishlists@example.test>" },
  deployContext: "dev",
  pool: database.pool,
  transport: consoleTransport()
});

const TYPES = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
  ".xml": "application/xml"
};

async function serveApp(req, res) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const headers = new Headers();

  for (const [name, value] of Object.entries(req.headers)) {
    headers.set(name, Array.isArray(value) ? value.join(", ") : value);
  }

  const request = new Request(`http://localhost:${port}${req.url}`, {
    body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks),
    headers,
    method: req.method
  });

  const response = await handle(request, { ip: req.socket.remoteAddress });
  res.statusCode = response.status;

  for (const [name, value] of response.headers) {
    if (name !== "set-cookie") {
      res.setHeader(name, value);
    }
  }

  res.setHeader("Set-Cookie", response.headers.getSetCookie());
  res.end(Buffer.from(await response.arrayBuffer()));
}

function serveStatic(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  let file = path.join(distDir, pathname);

  if (!file.startsWith(distDir)) {
    res.statusCode = 403;
    res.end();
    return;
  }

  if (existsSync(file) && statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }

  if (!existsSync(file)) {
    res.statusCode = 404;
    file = path.join(distDir, "404.html");

    if (!existsSync(file)) {
      res.end("Not found. Run npm run build first.");
      return;
    }
  }

  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  const isApp = /^\/wishlists(\/|$|\?)/.test(req.url);

  (isApp ? serveApp(req, res) : Promise.resolve(serveStatic(req, res))).catch((error) => {
    console.error(error);
    res.statusCode = 500;
    res.end();
  });
});

server.listen(port, () => {
  console.log(`Wishlists running at http://localhost:${port}/wishlists/`);
});

async function shutdown() {
  server.close();
  await database.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
