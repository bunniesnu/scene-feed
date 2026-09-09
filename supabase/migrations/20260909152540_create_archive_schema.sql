-- Table definitions

CREATE TABLE public.archive_items (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    published_at    TIMESTAMPTZ,
    source_name     TEXT,
    source_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.tags (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name            TEXT NOT NULL,
    category        TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (name, category)
);

CREATE TABLE public.archive_item_tags (
    archive_item_id UUID NOT NULL REFERENCES public.archive_items(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (archive_item_id, tag_id)
);


-- Ensure RLS is enabled for the tables

ALTER TABLE public.archive_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_item_tags ENABLE ROW LEVEL SECURITY;


-- Policies

CREATE POLICY "Anyone can read archive items"
    ON public.archive_items
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Anyone can read tags"
    ON public.tags
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Anyone can read archive item tags"
    ON public.archive_item_tags
    FOR SELECT
    TO anon, authenticated
    USING (true);