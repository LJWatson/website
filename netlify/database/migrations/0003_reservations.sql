-- Wishlists: reservations. They sit in their own table so the queries behind a list
-- owner's view never join to them.

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Null once the owner deletes the item. item_snapshot then says what it was.
  item_id uuid REFERENCES items (id) ON DELETE SET NULL,
  reserver_id uuid NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity >= 1),
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'bought')),
  -- Name, link, list and owner at the time of reserving, updated if the item is deleted
  item_snapshot jsonb NOT NULL,
  -- The item's updated_at when the reserver last saw it, for "Changed since you reserved it"
  item_seen_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One reservation per member per item. Reserving more adds to it.
CREATE UNIQUE INDEX reservations_item_reserver_idx ON reservations (item_id, reserver_id) WHERE item_id IS NOT NULL;
CREATE INDEX reservations_reserver_idx ON reservations (reserver_id);

-- Keeps reservations when their item is deleted, however it's deleted: by the owner, with
-- its list, or when the owner is removed. The reserver then sees it as removed.
CREATE FUNCTION wishlists_keep_reservations_of_deleted_item() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE reservations
  SET item_id = NULL,
      item_snapshot = item_snapshot || jsonb_build_object('name', OLD.name, 'url', OLD.url, 'removed', true)
  WHERE item_id = OLD.id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER items_keep_reservations
BEFORE DELETE ON items
FOR EACH ROW EXECUTE FUNCTION wishlists_keep_reservations_of_deleted_item();

-- A member can never reserve an item on their own list, whatever the app does
CREATE FUNCTION wishlists_check_reserver_is_not_owner() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.item_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM items i JOIN lists l ON l.id = i.list_id
    WHERE i.id = NEW.item_id AND l.owner_id = NEW.reserver_id
  ) THEN
    RAISE EXCEPTION 'A member cannot reserve items on their own list';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reservations_check_reserver
BEFORE INSERT OR UPDATE OF item_id, reserver_id ON reservations
FOR EACH ROW EXECUTE FUNCTION wishlists_check_reserver_is_not_owner();
