import { supabase } from "@/lib/supabase";

interface ArchiveMutationItem {
  title: string
  description: string | null
  published_at: string
  source_name: string | null
  source_url: string | null
}

export async function postArchiveItem(item: ArchiveMutationItem) {
  const { error } = await supabase
    .from("archive_items")
    .insert(item)
  return error
}