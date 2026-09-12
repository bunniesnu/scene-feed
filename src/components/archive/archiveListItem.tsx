import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import type { ArchiveItem } from "@/types/archive"
import { ArchivePopup } from "@/components/archive/archivePopup";

function ArchiveListItemCard({ item, onClick }: { item: ArchiveItem; onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
      onClick={onClick}
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
  )
}

export function ArchiveListItem({ item }: { item: ArchiveItem }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<ArchiveListItemCard item={item} onClick={() => setOpen(true)} />} />
      <ArchivePopup item={item} />
    </Dialog>
  )
}