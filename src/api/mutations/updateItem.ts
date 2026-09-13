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
      const { error } = await supabase.rpc("update_archive_item", {
        p_id: item.id,
        p_title: item.title,
        p_description: item.description,
        p_published_at: item.published_at.toISOString(),
        p_sources: item.sources, 
        p_tag_ids: item.tag_ids,
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["archiveItems"] });
    },
  });
}