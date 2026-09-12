import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { TagCategory } from "@/constants/tags"

interface CreateTagInput {
  name: string
  category: TagCategory
}

export function usePostTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, category }: CreateTagInput) => {
      const { data, error } = await supabase
        .from("tags")
        .insert({
          name: name.trim(),
          category,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tags"],
      })
    },
  })
}