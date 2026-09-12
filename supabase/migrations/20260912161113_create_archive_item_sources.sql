-- Create sources table

CREATE TABLE public.archive_item_sources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archive_item_id UUID NOT NULL REFERENCES public.archive_items(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    url             TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Remove the old source columns

ALTER TABLE public.archive_items
    DROP COLUMN source_name,
    DROP COLUMN source_url;


-- Enable RLS

ALTER TABLE public.archive_item_sources ENABLE ROW LEVEL SECURITY;


-- Public read access

CREATE POLICY "Anyone can read archive item sources"
    ON public.archive_item_sources
    FOR SELECT
    TO anon, authenticated
    USING (true);