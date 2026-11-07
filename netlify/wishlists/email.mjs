import nodemailer from "nodemailer";

// mailbox.org over implicit TLS, with an application password limited to SMTP
export function smtpTransport({ smtpUser, smtpPassword }) {
  let transporter;

  return async (message) => {
    if (!smtpUser || !smtpPassword) {
      throw new Error("SMTP_USER and SMTP_APP_PASSWORD aren't set");
    }

    transporter ??= nodemailer.createTransport({
      auth: { pass: smtpPassword, user: smtpUser },
      host: "smtp.mailbox.org",
      port: 465,
      secure: true
    });

    const info = await transporter.sendMail(message);

    // The mail server's reply, such as "250 2.0.0 Ok: queued as …". Never the address or content.
    console.log(`Email accepted by the mail server: ${info.accepted.length} accepted, ${info.rejected.length} rejected. Reply: ${info.response}`);
  };
}

// Local development only: prints the email, including its link and code, to the terminal
export function consoleTransport() {
  return async (message) => {
    console.log(`\n--- Email (local development only) ---\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n--------------------------------------\n`);
  };
}

// Deploy previews and branch deploys get a copy of production data, so they only email the admin
export async function deliver(app, message) {
  if (!["dev", "production"].includes(app.deployContext)) {
    const admin = await app.db.one("SELECT 1 FROM members WHERE role = 'admin' AND email = $1", [message.to]);

    if (!admin) {
      console.log(`Email not sent: ${app.deployContext || "unknown"} deploys only send email to the admin`);
      return false;
    }
  }

  await app.transport({ from: app.config.emailFrom, ...message });
  return true;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlEmail(paragraphs) {
  const body = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n");

  return `<!DOCTYPE html>\n<html lang="en-GB">\n<head><meta charset="utf-8"><title>Wishlists</title></head>\n<body>\n${body}\n</body>\n</html>`;
}

export function logInEmail({ code, link, name }) {
  return {
    html: htmlEmail([
      `Hello ${escapeHtml(name)},`,
      `<a href="${escapeHtml(link)}">Log in to wishlists</a>`,
      `Or copy this link into your browser: ${escapeHtml(link)}`,
      `If you asked to log in from the wishlists app on your home screen, enter this code there instead: <strong>${code}</strong>`,
      "The link and the code work once, and stop working after 15 minutes. If you didn't ask to log in, you can ignore this email."
    ]),
    subject: `Your wishlists log-in code: ${code}`,
    text: [
      `Hello ${name},`,
      `Log in to wishlists with this link:\n${link}`,
      `If you asked to log in from the wishlists app on your home screen, enter this code there instead: ${code}`,
      "The link and the code work once, and stop working after 15 minutes. If you didn't ask to log in, you can ignore this email."
    ].join("\n\n")
  };
}

export function invitationEmail({ inviterName, link, name }) {
  return {
    html: htmlEmail([
      `Hello ${escapeHtml(name)},`,
      `${escapeHtml(inviterName)} has invited you to share wishlists with the family, and reserve gifts without spoiling the surprise.`,
      `<a href="${escapeHtml(link)}">Accept your invitation</a>`,
      `Or copy this link into your browser: ${escapeHtml(link)}`,
      "The invitation works once, and stops working after 7 days."
    ]),
    subject: `${inviterName} has invited you to share wishlists`,
    text: [
      `Hello ${name},`,
      `${inviterName} has invited you to share wishlists with the family, and reserve gifts without spoiling the surprise.`,
      `Accept your invitation with this link:\n${link}`,
      "The invitation works once, and stops working after 7 days."
    ].join("\n\n")
  };
}
