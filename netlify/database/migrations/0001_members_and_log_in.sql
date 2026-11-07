-- Wishlists: members, invitations, log-in tokens and sessions

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (email = lower(email)),
  display_name text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  invited_by uuid REFERENCES members (id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invitations_email_idx ON invitations (email);

-- One row per log-in email. The link (token_hash) or the code (code_hash) uses it up.
-- The code only works in the browser holding the pending log-in cookie.
CREATE TABLE login_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  code_hash text NOT NULL,
  pending_cookie_hash text NOT NULL,
  failed_code_attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  requested_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX login_tokens_pending_cookie_idx ON login_tokens (pending_cookie_hash);

-- The cookie holds a random session token. Only its hash is stored, so a copy of the
-- database can't be used to log in. The id is what the Account page uses to revoke one.
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  member_id uuid NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  user_agent_summary text
);

CREATE INDEX sessions_member_idx ON sessions (member_id);

-- Admin actions, kept for 12 months. target_member_id has no foreign key so entries
-- outlive a removed member.
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES members (id) ON DELETE SET NULL,
  action text NOT NULL,
  target_member_id uuid,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Rate limiting. Buckets are hashes (of an email address, IP address or session),
-- never the values themselves, and rows are purged after 24 hours.
CREATE TABLE rate_limit_events (
  id bigserial PRIMARY KEY,
  bucket text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rate_limit_events_bucket_idx ON rate_limit_events (bucket, created_at);
