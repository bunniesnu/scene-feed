import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ArchiveMutationItem {
  title: string;
  description: string | null;
  published_at: string;
  source_name: string | null;
  source_url: string | null;
}

export function usePostArchiveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: ArchiveMutationItem) => {
      const { error } = await supabase
        .from("archive_items")
        .insert(item);

      if (error) {
        throw error;
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["archiveItems"],
      });
    },
  });
}