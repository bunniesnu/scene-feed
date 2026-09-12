import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

interface ArchiveItemProps {
  item: {
    id: string
    title: string
    description: string | null
    publishedAt: Date
    sourceName: string | null
    sourceUrl: string | null
  }
}

export function ArchiveListItem({ item }: ArchiveItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
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
              {item.publishedAt.toLocaleString(undefined, {
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

      <Dialog open={open} onOpenChange={setOpen}>
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

            <div className="text-sm text-muted-foreground">
              {item.publishedAt.toLocaleString(undefined, {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </div>

            {item.sourceName && (
              <p className="text-sm">
                Source: {item.sourceName}
              </p>
            )}

            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4"
                onClick={(event) => event.stopPropagation()}
              >
                Open source
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}