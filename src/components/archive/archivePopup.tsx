import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowUpRightIcon } from "lucide-react"
import type { ArchiveItemWithTagsAndSources } from "@/types/archive"
import { Badge } from "@/components/ui/badge";

function SourceLink({ sourceName, sourceUrl }: { sourceName: string | null; sourceUrl: string | null }) {
  if (!sourceName && !sourceUrl) {
    return null
  }

  if (!sourceUrl) {
    return (
      <p className="text-sm text-muted-foreground">
        Source: {sourceName}
      </p>
    )
  }

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm underline underline-offset-4 flex items-center"
    >
      {sourceName ? sourceName : "Open source"}
      <ArrowUpRightIcon className="inline-block ml-1 h-4 w-4" />
    </a>
  )
}

export function ArchivePopup({ item }: { item: ArchiveItemWithTagsAndSources }) {
  return (
    <DialogContent>
      <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        {item.description && (
        <p className="whitespace-pre-wrap text-sm">
            {item.description}
        </p>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
              {new Date(item.published_at).toLocaleString(undefined, {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              })}
          </div>
          <div className="flex gap-2">
            { item.sources.map(source => <SourceLink sourceName={source.name} sourceUrl={source.url} />) }
          </div>
        </div>
      </div>
    </DialogContent>
  )
}