import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { TZDate } from "@date-fns/tz";

async function getArchiveItems(start: Date, end: Date) {
  const { data, error } = await supabase
    .from("archive_items")
    .select(`
      *,
      tags:archive_item_tags(
        tag:tags(
          id,
          name,
          category
        )
      ),
      sources:archive_item_sources(
        id,
        name,
        url
      )
    `)
    .gte("published_at", start.toISOString())
    .lt("published_at", end.toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item) => ({
    ...item,
    created_at: new TZDate(item.created_at),
    updated_at: new TZDate(item.updated_at),
    published_at: new TZDate(item.published_at),
    tags: item.tags.map((itemTag) => itemTag.tag),
    sources: item.sources,
  }));

}

export function useArchiveItems(start: Date, end: Date) {
  return useQuery({
    queryKey: ["archiveItems", start, end],
    queryFn: () => getArchiveItems(start, end),
  })
}