#!/usr/bin/env node

// Sends one test email through mailbox.org with the same settings the wishlists app uses,
// and prints the mail server's reply or its exact error. It asks for the settings as it
// runs, hides the password while you type it, and saves nothing.
//
//   node scripts/wishlists-test-email.mjs

import readline from "node:readline";
import nodemailer from "nodemailer";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
let hidden = false;

// While hidden, show nothing of what's typed
rl._writeToOutput = (text) => {
  if (!hidden || text.includes("\n") || text.startsWith("SMTP_APP_PASSWORD")) {
    rl.output.write(text);
  }
};

function ask(question, { secret = false } = {}) {
  return new Promise((resolve) => {
    hidden = secret;
    rl.question(question, (answer) => {
      hidden = false;

      if (secret) {
        rl.output.write("\n");
      }

      resolve(answer.trim());
    });
  });
}

const user = await ask("SMTP_USER (the mailbox.org address you log in with): ");
const password = await ask("SMTP_APP_PASSWORD (hidden as you type): ", { secret: true });
const from = await ask("EMAIL_FROM (press Enter for \"Wishlists\" <wishlists@tink.uk>): ") || "\"Wishlists\" <wishlists@tink.uk>";
const to = await ask("Send the test email to: ");
rl.close();

const transporter = nodemailer.createTransport({
  auth: { pass: password, user },
  host: "smtp.mailbox.org",
  port: 465,
  secure: true
});

console.log("\nChecking the log-in with mailbox.org...");

try {
  await transporter.verify();
  console.log("Log-in accepted. SMTP_USER and SMTP_APP_PASSWORD work.");
} catch (error) {
  console.log(`Log-in refused. ${error.responseCode || ""} ${error.response || error.message}`);
  console.log("Check that SMTP_USER is the account's main address, not an alias, and that the password is an application password for SMTP.");
  process.exit(1);
}

console.log("Sending the test email...");

try {
  const info = await transporter.sendMail({
    from,
    subject: "Wishlists test email",
    text: "This is a test email from the wishlists set-up script. If it arrived, sending works.",
    to
  });
  console.log(`Sent. ${info.accepted.length} accepted, ${info.rejected.length} rejected. Mail server reply: ${info.response}`);
} catch (error) {
  console.log(`Sending refused. ${error.responseCode || ""} ${error.response || error.message}`);
  console.log("If it mentions the sender, EMAIL_FROM uses an address that isn't set up as an alias on the SMTP_USER account.");
  process.exit(1);
}
