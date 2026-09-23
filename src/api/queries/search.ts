import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

export function useSearchArchive(keyword: string) {
  return useQuery({
    queryKey: ["archive_items", "search", keyword],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_archive", {
        keyword,
      })

      if (error) {
        throw error
      }

      return data
    },
    enabled: Boolean(keyword.trim()),
  })
}