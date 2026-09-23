CREATE OR REPLACE FUNCTION search_archive(keyword text)
RETURNS SETOF archive_items LANGUAGE sql STABLE AS $$
  SELECT ai.*
  FROM archive_items ai
  LEFT JOIN archive_item_tags ait ON ai.id = ait.archive_item_id
  LEFT JOIN tags t ON t.id = ait.tag_id
  WHERE 
    ai.title ILIKE '%' || keyword || '%'
    OR ai.description ILIKE '%' || keyword || '%'
    OR t.name ILIKE '%' || keyword || '%'
  GROUP BY ai.id
  ORDER BY 
    MAX(
      similarity(ai.title, keyword) * 2.0 + 
      similarity(coalesce(ai.description, ''), keyword) * 1.0 +
      similarity(coalesce(t.name, ''), keyword) * 1.5
    ) DESC;
$$;