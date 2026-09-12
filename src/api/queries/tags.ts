import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, category")
        .order("category")
        .order("name")

      if (error) {
        throw error
      }

      return data
    },
  })
}