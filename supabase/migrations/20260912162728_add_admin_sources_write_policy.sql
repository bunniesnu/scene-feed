-- Archive item sources

CREATE POLICY "Admins can insert archive item sources"
    ON public.archive_item_sources
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update archive item sources"
    ON public.archive_item_sources
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete archive item sources"
    ON public.archive_item_sources
    FOR DELETE
    TO authenticated
    USING (public.is_admin());