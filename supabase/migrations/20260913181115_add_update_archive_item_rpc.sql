-- 1. Create the composite type matching the sources interface
CREATE TYPE source_update_input AS (
  id UUID,
  name TEXT,
  url TEXT
);

-- 2. Define the RPC with exact types based on ArchiveMutationItem
CREATE OR REPLACE FUNCTION update_archive_item(
  p_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_published_at TIMESTAMPTZ,
  p_sources source_update_input[],
  p_tag_ids UUID[]
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  -- 1. Update main item
  UPDATE archive_items 
  SET
    title = p_title,
    description = p_description,
    published_at = p_published_at,
    updated_at = NOW()
  WHERE id = p_id;

  -- 2. Sync sources
  DELETE FROM archive_item_sources 
  WHERE archive_item_id = p_id 
  AND id NOT IN (SELECT id FROM unnest(p_sources) WHERE id IS NOT NULL);

  INSERT INTO archive_item_sources (id, archive_item_id, name, url)
  SELECT COALESCE(id, gen_random_uuid()), p_id, name, url
  FROM unnest(p_sources)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, url = EXCLUDED.url;

  -- 3. Sync tags
  DELETE FROM archive_item_tags 
  WHERE archive_item_id = p_id AND tag_id != ALL(p_tag_ids);

  INSERT INTO archive_item_tags (archive_item_id, tag_id)
  SELECT p_id, unnest(p_tag_ids)
  ON CONFLICT DO NOTHING;
END;
$$;