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
  const homeScreen = "Note: if you're using Wishlists from your homescreen, you'll need to use the code.";
  const lifetime = "The link and the code will work for the next 15 minutes, but you can only use them once.";

  return {
    html: htmlEmail([
      `Hello ${escapeHtml(name)},`,
      `You can <a href="${escapeHtml(link)}">log into Wishlists</a>, or paste this URL into your browser:<br>${escapeHtml(link)}`,
      `Alternatively, you can enter this code:<br><strong>${code}</strong>`,
      homeScreen,
      lifetime
    ]),
    subject: "Log into Wishlists",
    text: [
      `Hello ${name},`,
      `You can log into Wishlists, or paste this URL into your browser:\n${link}`,
      `Alternatively, you can enter this code:\n${code}`,
      homeScreen,
      lifetime
    ].join("\n\n")
  };
}

export function invitationEmail({ inviterName, link, name }) {
  return {
    html: htmlEmail([
      `Hello ${escapeHtml(name)},`,
      `${escapeHtml(inviterName)} has invited you to Wishlists, where the family shares wishlists and reserves gifts without spoiling the surprise.`,
      `<a href="${escapeHtml(link)}">Accept your invitation</a>`,
      `Or copy this link into your browser: ${escapeHtml(link)}`,
      "The invitation works once, and stops working after 7 days."
    ]),
    subject: `${inviterName} has invited you to Wishlists`,
    text: [
      `Hello ${name},`,
      `${inviterName} has invited you to Wishlists, where the family shares wishlists and reserves gifts without spoiling the surprise.`,
      `Accept your invitation with this link:\n${link}`,
      "The invitation works once, and stops working after 7 days."
    ].join("\n\n")
  };
}
