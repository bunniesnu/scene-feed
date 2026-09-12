-- Archive items

CREATE POLICY "Admins can insert archive items"
    ON public.archive_items
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update archive items"
    ON public.archive_items
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete archive items"
    ON public.archive_items
    FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- Tags

CREATE POLICY "Admins can insert tags"
    ON public.tags
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update tags"
    ON public.tags
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete tags"
    ON public.tags
    FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- Archive item tags

CREATE POLICY "Admins can insert archive item tags"
    ON public.archive_item_tags
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update archive item tags"
    ON public.archive_item_tags
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete archive item tags"
    ON public.archive_item_tags
    FOR DELETE
    TO authenticated
    USING (public.is_admin());