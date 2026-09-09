import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

async function _getArchiveItems(start: Date, end: Date) {
  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .gte("published_at", start.toISOString())
    .lt("published_at", end.toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function useArchiveItems(start: Date, end: Date) {
  return useQuery({
    queryKey: ["archiveItems", start, end],
    queryFn: () => _getArchiveItems(start, end),
  })
}