CREATE TYPE source_input AS (
  name TEXT,
  url TEXT
);

CREATE OR REPLACE FUNCTION create_archive_item(
  p_title TEXT,
  p_description TEXT,
  p_published_at TIMESTAMPTZ,
  p_sources source_input[],
  p_tag_ids UUID[]
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_item_id UUID;
BEGIN
  -- 1. Insert main item
  INSERT INTO archive_items (title, description, published_at)
  VALUES (p_title, p_description, p_published_at)
  RETURNING id INTO v_item_id;

  -- 2. Insert sources
  INSERT INTO archive_item_sources (archive_item_id, name, url)
  SELECT v_item_id, name, url
  FROM unnest(p_sources);

  -- 3. Insert tags
  INSERT INTO archive_item_tags (archive_item_id, tag_id)
  SELECT v_item_id, unnest(p_tag_ids);
END;
$$;