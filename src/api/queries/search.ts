import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { TZDate } from "@date-fns/tz"

async function searchArchive(keyword: string) {
  const { data, error } = await supabase.rpc("search_archive", {
    keyword,
  })

  if (error) {
    throw error
  }

  return data.map((item) => ({
      ...item,
      created_at: new TZDate(item.created_at),
      updated_at: new TZDate(item.updated_at),
      published_at: new TZDate(item.published_at),
      tags: item.tags.map((itemTag) => itemTag.tag).filter((tag): tag is NonNullable<typeof tag> => tag !== null).flatMap((tag) =>
        tag.id && tag.name
          ? [{ ...tag, id: tag.id, name: tag.name, category: tag.category ?? '' }]
          : []
      ),
      sources: item.sources.flatMap((source) =>
        source.id && source.name && source.url
          ? [{ id: source.id, name: source.name, url: source.url }]
          : []
      ),
    }));
}

export function useSearchArchive(keyword: string) {
  return useQuery({
    queryKey: ["archive_items", "search", keyword],
    queryFn: () => searchArchive(keyword),
    enabled: Boolean(keyword.trim()),
  })
}