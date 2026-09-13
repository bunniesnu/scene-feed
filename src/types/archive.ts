import type { Tables } from "@/lib/supabase.types";
import { TZDate } from "@date-fns/tz";

type ArchiveItemBase = Tables<"archive_items">;

export type ArchiveItem = {
  [K in keyof ArchiveItemBase]: K extends "published_at"
    ? undefined extends ArchiveItemBase[K]
      ? null extends ArchiveItemBase[K]
        ? TZDate | null | undefined
        : TZDate | undefined
      : null extends ArchiveItemBase[K]
      ? TZDate | null
      : TZDate
    : ArchiveItemBase[K];
};

type ArchiveItemTag = Pick<
  Tables<"tags">,
  "id" | "name" | "category"
>;

type ArchiveItemSource = Pick<
  Tables<"archive_item_sources">,
  "id" | "name" | "url"
>;

export type ArchiveItemWithTagsAndSources = ArchiveItem & {
  tags: ArchiveItemTag[];
} & {
  sources: ArchiveItemSource[];
};