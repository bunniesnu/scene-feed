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
}

export function usePostArchiveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: ArchiveMutationItem) => {
      const { sources, ...archiveItem } = item;

      const { data, error } = await supabase
        .from("archive_items")
        .insert(archiveItem)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      if (sources.length > 0) {
        const { error: sourcesError } = await supabase
          .from("archive_item_sources")
          .insert(
            sources.map((source) => ({
              archive_item_id: data.id,
              name: source.name,
              url: source.url,
            })),
          );

        if (sourcesError) {
          throw sourcesError;
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