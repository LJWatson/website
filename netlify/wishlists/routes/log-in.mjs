import { deliver, logInEmail } from "../email.mjs";
import { redirect } from "../http.mjs";
import { allow, bucket, countRecent, LIMITS, record } from "../rate-limit.mjs";
import { hashCode, randomCode, randomToken, safeEqual, sha256 } from "../security.mjs";
import { startSession } from "../sessions.mjs";
import { checkEmail, FormErrors, normaliseEmail } from "../validation.mjs";
import { invalid, page } from "./common.mjs";

const PENDING_COOKIE = "__Host-wishlists_pending";
const TOKEN_LIFETIME_SECONDS = 15 * 60;
const MAX_CODE_ATTEMPTS = 5;

// Fixed messages for pages reached by redirect after the session has ended
const STATUS_MESSAGES = {
  "account-deleted": { message: "Your account, lists and items have been deleted." },
  "logged-out": { message: "You've logged out." }
};

export function showLogIn(ctx) {
  if (ctx.member) {
    return redirect("/wishlists/");
  }

  ctx.flash = STATUS_MESSAGES[ctx.query.get("status")] || ctx.flash;
  return page(ctx, "log-in.html", { title: "Log in", values: {} });
}

// The reply is the same whether or not the address belongs to a member
export async function requestLogIn(ctx) {
  const email = normaliseEmail(ctx.form.get("email"));
  const errors = new FormErrors().add("email", checkEmail(email, "Enter your email address"));

  if (errors.any) {
    return invalid(ctx, "log-in.html", { errors, title: "Log in", values: { email } });
  }

  const ipAllowed = await allow(ctx.db, bucket("log-in-ip", ctx.ip), LIMITS.logInIp);
  const emailAllowed = ipAllowed && await allow(ctx.db, bucket("log-in-email", email), LIMITS.logInEmail);

  if (!emailAllowed) {
    return page(ctx, "log-in-limited.html", { title: "Too many log-in emails" }, 429);
  }

  const pending = randomToken();
  ctx.setCookie(PENDING_COOKIE, pending, TOKEN_LIFETIME_SECONDS);

  const member = await ctx.db.one("SELECT id, email, display_name FROM members WHERE email = $1 AND status = 'active'", [email]);

  if (member) {
    const token = randomToken();
    const code = randomCode();

    await ctx.db.query(
      `INSERT INTO login_tokens (member_id, token_hash, code_hash, pending_cookie_hash, expires_at, requested_ip)
       VALUES ($1, $2, $3, $4, now() + make_interval(secs => $5), $6)`,
      [member.id, sha256(token), hashCode(code, pending), sha256(pending), TOKEN_LIFETIME_SECONDS, ctx.ip]
    );

    const link = `${ctx.baseUrl}/wishlists/log-in/link/?token=${token}`;
    ctx.background(deliver(ctx.app, { to: member.email, ...logInEmail({ code, link, name: member.display_name }) }));
  }

  return redirect("/wishlists/log-in/code/");
}

export function showCode(ctx) {
  if (!ctx.cookies[PENDING_COOKIE]) {
    return redirect("/wishlists/log-in/");
  }

  return page(ctx, "log-in-code.html", { title: "Check your email", values: {} });
}

export async function enterCode(ctx) {
  const pending = ctx.cookies[PENDING_COOKIE];

  if (!pending) {
    return redirect("/wishlists/log-in/");
  }

  const code = String(ctx.form.get("code") || "").replace(/[\s-]/g, "");
  const failures = bucket("code-failures", sha256(pending));
  const errors = new FormErrors();
  const showError = (message, status = 400) => {
    errors.add("code", message);
    return page(ctx, "log-in-code.html", { errors, title: "Check your email", values: { code } }, status);
  };

  if (await countRecent(ctx.db, failures, LIMITS.codeFailures) >= MAX_CODE_ATTEMPTS) {
    return showError("You've entered too many wrong codes. Request a new log-in email.");
  }

  if (!/^\d{6}$/.test(code)) {
    return showError(code ? "Enter the 6-digit code from the email, using numbers only" : "Enter the 6-digit code from the email");
  }

  // The member's display name once logged in, otherwise null
  const loggedInAs = await ctx.db.transaction(async (db) => {
    const token = await db.one(
      `SELECT t.id, t.code_hash, t.failed_code_attempts, t.member_id, m.display_name
       FROM login_tokens t JOIN members m ON m.id = t.member_id
       WHERE t.pending_cookie_hash = $1 AND t.used_at IS NULL AND t.expires_at > now() AND m.status = 'active'
       ORDER BY t.created_at DESC LIMIT 1 FOR UPDATE OF t`,
      [sha256(pending)]
    );

    if (token && safeEqual(token.code_hash, hashCode(code, pending))) {
      await db.query("UPDATE login_tokens SET used_at = now() WHERE id = $1", [token.id]);
      await startSession(ctx, db, token.member_id);
      return token.display_name;
    }

    // Counted the same way whether or not a log-in email was sent, so it reveals nothing
    await record(db, failures);

    if (token) {
      const attempts = token.failed_code_attempts + 1;
      await db.query(
        `UPDATE login_tokens SET failed_code_attempts = $2::int,
         expires_at = CASE WHEN $2::int >= $3::int THEN now() ELSE expires_at END WHERE id = $1`,
        [token.id, attempts, MAX_CODE_ATTEMPTS]
      );
    }

    return null;
  });

  if (!loggedInAs) {
    if (await countRecent(ctx.db, failures, LIMITS.codeFailures) >= MAX_CODE_ATTEMPTS) {
      return showError("You've entered too many wrong codes. Request a new log-in email.");
    }

    return showError("That code didn't work. Check it against the latest log-in email. Codes stop working after 15 minutes.");
  }

  return loggedInRedirect(ctx, loggedInAs);
}

// Opening the link only shows a Log in button. Email security scanners that prefetch
// links make GET requests, so a GET never uses up the token.
export async function showLink(ctx) {
  const token = ctx.query.get("token") || "";
  const valid = token && await ctx.db.one(
    `SELECT m.display_name FROM login_tokens t JOIN members m ON m.id = t.member_id
     WHERE t.token_hash = $1 AND t.used_at IS NULL AND t.expires_at > now() AND m.status = 'active'`,
    [sha256(token)]
  );

  if (!valid) {
    return page(ctx, "link-invalid.html", { title: "Log-in link not valid" });
  }

  return page(ctx, "log-in-link.html", { name: valid.display_name, title: "Log in", token });
}

export async function useLink(ctx) {
  const token = ctx.form.get("token") || "";
  const failures = bucket("token-failures", ctx.ip);

  if (await countRecent(ctx.db, failures, LIMITS.tokenFailures) >= LIMITS.tokenFailures.limit) {
    return page(ctx, "link-invalid.html", { title: "Log-in link not valid" }, 429);
  }

  const loggedInAs = await ctx.db.transaction(async (db) => {
    const used = await db.one(
      `UPDATE login_tokens t SET used_at = now() FROM members m
       WHERE m.id = t.member_id AND t.token_hash = $1 AND t.used_at IS NULL AND t.expires_at > now() AND m.status = 'active'
       RETURNING t.member_id, m.display_name`,
      [sha256(token)]
    );

    if (!used) {
      return null;
    }

    await startSession(ctx, db, used.member_id);
    return used.display_name;
  });

  if (!loggedInAs) {
    await record(ctx.db, failures);
    return page(ctx, "link-invalid.html", { title: "Log-in link not valid" }, 400);
  }

  return loggedInRedirect(ctx, loggedInAs);
}

function loggedInRedirect(ctx, name) {
  ctx.clearCookie(PENDING_COOKIE);
  ctx.setFlash(`You're logged in as ${name}.`);
  return redirect("/wishlists/");
}
