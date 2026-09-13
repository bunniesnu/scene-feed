import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ArchiveMutationItem } from "@/api/mutations/insertItem";

export interface UpdateArchiveMutationItem extends ArchiveMutationItem {
  id: string;
  sources: {
    id: string | null;
    name: string;
    url: string;
  }[];
}

export function useUpdateArchiveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: UpdateArchiveMutationItem) => {
      const { id, sources, tag_ids, ...archiveItem } = item;

      const { error } = await supabase
        .from("archive_items")
        .update({
          ...archiveItem,
          published_at: archiveItem.published_at.toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      const validSourceIds = sources.map((s) => s.id).filter((id) => id !== null);
      if (sources.length > 0) {
        const { error: deleteSourcesError } = await supabase
          .from("archive_item_sources")
          .delete()
          .eq("archive_item_id", id)
          .filter("id", "not.in", validSourceIds);
        
        if (deleteSourcesError) {
          throw deleteSourcesError;
        }

        const { error: sourcesError } = await supabase
          .from("archive_item_sources")
          .upsert(
            sources.map((source) => ({
              ...(source.id ? { id: source.id } : {}),
              archive_item_id: id,
              name: source.name,
              url: source.url,
            })),
            { onConflict: "id" }
          );

        if (sourcesError) {
          throw sourcesError;
        }
      } else {
        const { error } = await supabase.from("archive_item_sources").delete().eq("archive_item_id", id);
        if (error) {
          throw error;
        }
      }

      if (tag_ids.length > 0) {
        const { error: deleteTagsError } =await supabase
          .from("archive_item_tags")
          .delete()
          .eq("archive_item_id", id)
          .filter("tag_id", "not.in", tag_ids);
        
        if (deleteTagsError) {
          throw deleteTagsError;
        }

        const { error: tagsError } = await supabase
          .from("archive_item_tags")
          .upsert(
            tag_ids.map((tagId) => ({ archive_item_id: id, tag_id: tagId })),
            { onConflict: "archive_item_id,tag_id" }
          );

        if (tagsError) {
          throw tagsError;
        }
      } else {
        const { error } = await supabase.from("archive_item_tags").delete().eq("archive_item_id", id);
        if (error) {
          throw error;
        }
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["archiveItems"],
      });
    },
  });
}