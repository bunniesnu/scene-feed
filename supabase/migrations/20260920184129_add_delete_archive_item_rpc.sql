CREATE OR REPLACE FUNCTION delete_archive_item(p_item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- 1. Delete tags
  DELETE FROM archive_item_tags
  WHERE archive_item_id = p_item_id;

  -- 2. Delete sources
  DELETE FROM archive_item_sources
  WHERE archive_item_id = p_item_id;

  -- 3. Delete main item
  DELETE FROM archive_items
  WHERE id = p_item_id;
END;
$$;