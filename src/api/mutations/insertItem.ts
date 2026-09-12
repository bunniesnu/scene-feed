import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ArchiveMutationItem {
  title: string;
  description: string | null;
  published_at: string;
  sources: {
    name: string;
    url: string;
  }[];
  tag_ids: string[];
}

export function usePostArchiveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: ArchiveMutationItem) => {
      const { sources, tag_ids, ...archiveItem } = item;

      const { data, error } = await supabase
        .from("archive_items")
        .insert(archiveItem)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      const archiveItemId = data.id;

      if (sources.length > 0) {
        const { error: sourcesError } = await supabase
          .from("archive_item_sources")
          .insert(
            sources.map((source) => ({
              archive_item_id: archiveItemId,
              name: source.name,
              url: source.url,
            })),
          );

        if (sourcesError) {
          throw sourcesError;
        }
      }

      if (tag_ids.length > 0) {
        const { error: tagsError } = await supabase
          .from("archive_item_tags")
          .insert(
            tag_ids.map((tagId) => ({
              archive_item_id: archiveItemId,
              tag_id: tagId,
            })),
          );

        if (tagsError) {
          throw tagsError;
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