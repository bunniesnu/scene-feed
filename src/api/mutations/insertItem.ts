import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TZDate } from "@date-fns/tz";

export interface ArchiveMutationItem {
  title: string;
  description: string;
  published_at: TZDate;
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
      const { error } = await supabase.rpc("create_archive_item", {
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