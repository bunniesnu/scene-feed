import type { Tables } from "@/lib/supabase.types";

export type ArchiveItem = Tables<"archive_items">;
type ArchiveItemTag = Pick<
  Tables<"tags">,
  "id" | "name" | "category"
>;
export type ArchiveItemWithTags = ArchiveItem & {
  tags: ArchiveItemTag[];
};