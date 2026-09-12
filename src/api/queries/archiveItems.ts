import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

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
    tags: item.tags.map((itemTag) => itemTag.tag),
  }));

}

export function useArchiveItems(start: Date, end: Date) {
  return useQuery({
    queryKey: ["archiveItems", start, end],
    queryFn: () => getArchiveItems(start, end),
  })
}