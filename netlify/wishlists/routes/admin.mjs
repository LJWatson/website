import { audit } from "../audit.mjs";
import { redirect } from "../http.mjs";
import { getMember, removeMember, sendInvitation } from "../members.mjs";
import { endBrowserSession, revokeAllSessions } from "../sessions.mjs";
import { checkDisplayName, checkEmail, FormErrors, normaliseEmail, normaliseText } from "../validation.mjs";
import { invalid, notFound, page } from "./common.mjs";

const MEMBERS_PATH = "/wishlists/admin/members/";

async function membersPageData(ctx) {
  const [members, invitations] = await Promise.all([
    ctx.db.query(
      `SELECT m.id, m.email, m.display_name, m.role, m.status, m.created_at,
       (SELECT max(s.last_used_at) FROM sessions s WHERE s.member_id = m.id) AS last_active_at
       FROM members m ORDER BY m.role, lower(m.display_name)`
    ),
    ctx.db.query(
      `SELECT id, email, display_name, expires_at, expires_at < now() AS expired
       FROM invitations WHERE used_at IS NULL ORDER BY created_at DESC`
    )
  ]);

  return { invitations, members, title: "Members" };
}

export async function showMembers(ctx) {
  return page(ctx, "admin-members.html", { ...await membersPageData(ctx), values: {} });
}

export async function invite(ctx) {
  const email = normaliseEmail(ctx.form.get("email"));
  const displayName = normaliseText(ctx.form.get("display_name"));
  const errors = new FormErrors()
    .add("email", checkEmail(email, "Enter their email address"))
    .add("display_name", checkDisplayName(displayName));

  if (!errors.byField.email) {
    const existing = await ctx.db.one("SELECT display_name FROM members WHERE email = $1", [email]);

    if (existing) {
      errors.add("email", `That email address already belongs to ${existing.display_name}`);
    }
  }

  if (errors.any) {
    return invalid(ctx, "admin-members.html", {
      ...await membersPageData(ctx),
      errors,
      values: { display_name: displayName, email }
    });
  }

  const { invitation, sent } = await sendInvitation(ctx, { displayName, email });
  await audit(ctx.db, ctx.member.id, "invite", null, { invitation_id: invitation.id, sent });
  flashInvitation(ctx, sent, displayName);
  return redirect(MEMBERS_PATH);
}

export async function resendInvitation(ctx, { id }) {
  const { invitation, sent } = await sendInvitation(ctx, { invitationId: id });

  if (!invitation) {
    return notFound(ctx);
  }

  await audit(ctx.db, ctx.member.id, "resend-invitation", null, { invitation_id: id, sent });
  flashInvitation(ctx, sent, invitation.display_name);
  return redirect(MEMBERS_PATH);
}

function flashInvitation(ctx, sent, name) {
  if (sent) {
    ctx.setFlash(`Invitation emailed to ${name}. It works for 7 days.`);
  } else {
    ctx.setFlash(`The invitation to ${name} is saved, but the email couldn't be sent. Use Resend to try again.`);
  }
}

export async function revokeInvitation(ctx, { id }) {
  const revoked = await ctx.db.one("DELETE FROM invitations WHERE id = $1 AND used_at IS NULL RETURNING display_name", [id]);

  if (!revoked) {
    return notFound(ctx);
  }

  await audit(ctx.db, ctx.member.id, "revoke-invitation", null, { invitation_id: id });
  ctx.setFlash(`The invitation to ${revoked.display_name} no longer works.`);
  return redirect(MEMBERS_PATH);
}

export async function showEditMember(ctx, { id }) {
  const member = await getMember(ctx.db, id);

  if (!member) {
    return notFound(ctx);
  }

  return page(ctx, "admin-member-edit.html", { target: member, title: `Edit ${member.display_name}`, values: member });
}

export async function editMember(ctx, { id }) {
  const member = await getMember(ctx.db, id);

  if (!member) {
    return notFound(ctx);
  }

  const email = normaliseEmail(ctx.form.get("email"));
  const displayName = normaliseText(ctx.form.get("display_name"));
  const errors = new FormErrors()
    .add("display_name", checkDisplayName(displayName))
    .add("email", checkEmail(email, "Enter their email address"));

  if (!errors.byField.email) {
    const existing = await ctx.db.one("SELECT display_name FROM members WHERE email = $1 AND id <> $2", [email, id]);

    if (existing) {
      errors.add("email", `That email address already belongs to ${existing.display_name}`);
    }
  }

  if (errors.any) {
    return invalid(ctx, "admin-member-edit.html", {
      errors,
      target: member,
      title: `Edit ${member.display_name}`,
      values: { display_name: displayName, email }
    });
  }

  await ctx.db.query("UPDATE members SET display_name = $2, email = $3 WHERE id = $1", [id, displayName, email]);
  await audit(ctx.db, ctx.member.id, "edit-member", id, { email_changed: email !== member.email });
  ctx.setFlash(`${displayName}'s details are saved.`);
  return redirect(MEMBERS_PATH);
}

// The admin account can't be suspended or removed from inside the app
async function getManageableMember(ctx, id) {
  const member = await getMember(ctx.db, id);
  return member && member.role !== "admin" ? member : null;
}

export async function suspendMember(ctx, { id }) {
  const member = await getManageableMember(ctx, id);

  if (!member) {
    return notFound(ctx);
  }

  await ctx.db.transaction(async (db) => {
    await db.query("UPDATE members SET status = 'suspended' WHERE id = $1", [id]);
    await revokeAllSessions(db, id);
    await audit(db, ctx.member.id, "suspend", id);
  });

  ctx.setFlash(`${member.display_name} is suspended and logged out everywhere. Their lists are hidden from other members.`);
  return redirect(MEMBERS_PATH);
}

export async function reinstateMember(ctx, { id }) {
  const member = await getManageableMember(ctx, id);

  if (!member) {
    return notFound(ctx);
  }

  await ctx.db.query("UPDATE members SET status = 'active' WHERE id = $1", [id]);
  await audit(ctx.db, ctx.member.id, "reinstate", id);
  ctx.setFlash(`${member.display_name} can log in again.`);
  return redirect(MEMBERS_PATH);
}

export async function revokeMemberSessions(ctx, { id }) {
  const member = await getMember(ctx.db, id);

  if (!member) {
    return notFound(ctx);
  }

  await revokeAllSessions(ctx.db, id);
  await audit(ctx.db, ctx.member.id, "revoke-sessions", id);

  if (id === ctx.member.id) {
    endBrowserSession(ctx);
    return redirect("/wishlists/log-in/?status=logged-out");
  }

  ctx.setFlash(`${member.display_name} is logged out on every device.`);
  return redirect(MEMBERS_PATH);
}

export async function showRemoveMember(ctx, { id }) {
  const member = await getManageableMember(ctx, id);

  if (!member) {
    return notFound(ctx);
  }

  return page(ctx, "admin-member-remove.html", { target: member, title: `Remove ${member.display_name}` });
}

export async function removeMemberAction(ctx, { id }) {
  const member = await getManageableMember(ctx, id);

  if (!member) {
    return notFound(ctx);
  }

  await ctx.db.transaction(async (db) => {
    await removeMember(db, id);
    await audit(db, ctx.member.id, "remove", id, { display_name: member.display_name });
  });

  ctx.setFlash(`${member.display_name} has been removed, with their lists and items.`);
  return redirect(MEMBERS_PATH);
}
