CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_archive_items_search ON public.archive_items 
USING gin ((title || ' ' || coalesce(description, '')) gin_trgm_ops);

CREATE INDEX idx_tags_name_trgm ON public.tags 
USING gin (name gin_trgm_ops);