import type { Tables } from "@/lib/supabase.types";
import { TZDate } from "@date-fns/tz";

type ArchiveItemBase = Tables<"archive_items">;

type DateKeys = "published_at" | "created_at" | "updated_at";

export type ArchiveItem = {
  [K in keyof ArchiveItemBase]: K extends DateKeys
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