import type { Tables } from "@/lib/supabase.types";

export type ArchiveItem = Tables<"archive_items">;

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