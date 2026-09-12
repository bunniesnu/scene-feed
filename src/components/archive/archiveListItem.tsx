import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { ArrowUpRightIcon } from "lucide-react"
import type { ArchiveItem } from "@/types/archive"

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

interface ArchiveItemProps {
  item: ArchiveItem
}

export function ArchiveListItem({ item }: ArchiveItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Card
          className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
          onClick={() => setOpen(true)}
        >
          <CardContent className="flex items-center justify-between p-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.title}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                {new Date(item.published_at).toLocaleString(undefined, {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            <SourceLink sourceName={item.source_name} sourceUrl={item.source_url} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}