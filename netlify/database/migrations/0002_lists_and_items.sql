-- Wishlists: lists and their items. Reservations come in a later migration, in their own
-- table, so the queries behind the owner's view never touch them.

CREATE TABLE lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  occasion_date date,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX lists_owner_idx ON lists (owner_id);

-- updated_at changes only when the item's details change, not when it's moved,
-- because it drives the "Changed since you reserved it" notice.
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists (id) ON DELETE CASCADE,
  name text NOT NULL,
  url text,
  price numeric(10, 2) CHECK (price >= 0),
  price_currency text NOT NULL DEFAULT 'GBP' CHECK (price_currency IN ('GBP', 'USD', 'EUR')),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 99),
  most_wanted boolean NOT NULL DEFAULT false,
  similar_ok boolean NOT NULL DEFAULT false,
  notes text,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX items_list_position_idx ON items (list_id, position);
