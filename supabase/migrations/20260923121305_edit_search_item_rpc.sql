DROP FUNCTION IF EXISTS public.search_archive(text);
DROP TYPE IF EXISTS public.tag_wrapper CASCADE;
DROP TYPE IF EXISTS public.tag_payload CASCADE;
DROP TYPE IF EXISTS public.source_payload CASCADE;

CREATE TYPE public.tag_payload AS (
  id uuid,
  name text,
  category text
);

CREATE TYPE public.tag_wrapper AS (
  tag tag_payload
);

CREATE TYPE public.source_payload AS (
  id uuid,
  name text,
  url text
);

CREATE OR REPLACE FUNCTION public.search_archive(keyword text)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  tags tag_wrapper[],
  sources source_payload[]
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai.id,
    ai.title,
    ai.description,
    ai.published_at,
    ai.created_at,
    ai.updated_at,
    coalesce(
      (
        SELECT array_agg(ROW(ROW(t.id, t.name, t.category)::tag_payload)::tag_wrapper)
        FROM public.archive_item_tags ait
        JOIN public.tags t ON t.id = ait.tag_id
        WHERE ait.archive_item_id = ai.id
      ),
      ARRAY[]::tag_wrapper[]
    ) AS tags,
    coalesce(
      (
        SELECT array_agg(ROW(ais.id, ais.name, ais.url)::source_payload)
        FROM public.archive_item_sources ais
        WHERE ais.archive_item_id = ai.id
      ),
      ARRAY[]::source_payload[]
    ) AS sources
  FROM public.archive_items ai
  WHERE 
    ai.title ILIKE '%' || keyword || '%'
    OR coalesce(ai.description, '') ILIKE '%' || keyword || '%'
    OR EXISTS (
      SELECT 1 
      FROM public.archive_item_tags ait
      JOIN public.tags t ON t.id = ait.tag_id
      WHERE ait.archive_item_id = ai.id 
        AND t.name ILIKE '%' || keyword || '%'
    )
    OR EXISTS (
      SELECT 1 
      FROM public.archive_item_sources ais
      WHERE ais.archive_item_id = ai.id 
        AND ais.name ILIKE '%' || keyword || '%'
    )
  ORDER BY 
    (
      similarity(ai.title, keyword) * 2.0 + 
      similarity(coalesce(ai.description, ''), keyword) * 1.0 +
      coalesce((
        SELECT MAX(similarity(t.name, keyword)) * 1.5
        FROM public.archive_item_tags ait
        JOIN public.tags t ON t.id = ait.tag_id
        WHERE ait.archive_item_id = ai.id
      ), 0) +
      coalesce((
        SELECT MAX(similarity(ais.name, keyword)) * 1.0
        FROM public.archive_item_sources ais
        WHERE ais.archive_item_id = ai.id
      ), 0)
    ) DESC;
END;
$$;