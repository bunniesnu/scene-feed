import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { ArchiveItemForm } from "@/components/archive/archiveForm"
import type { ArchiveItemWithTagsAndSources } from "@/types/archive"
import { ArchivePopup } from "@/components/archive/archivePopup";
import { Badge } from "@/components/ui/badge";
import { useUpdateArchiveItem } from "@/api/mutations/updateItem"
import { useAdmin } from "@/hooks/auth/admin"
import { useDeleteArchiveItem } from "@/api/mutations/deleteItem"
import { CloseButton } from "@/components/closeButton"

function ArchiveListItemCard({ item, onClick }: { item: ArchiveItemWithTagsAndSources; onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between p-0">
        <div className="space-y-2">
          <div>
            <span className="font-medium">{item.title}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {item.published_at.toLocaleString(undefined, {
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

export function ArchiveListItem({ item }: { item: ArchiveItemWithTagsAndSources }) {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const updatePostArchiveItem = useUpdateArchiveItem()
  const deleteArchiveItem = useDeleteArchiveItem()
  const { isAdmin } = useAdmin()

  const handleDelete = () => {
    deleteArchiveItem.mutateAsync(item.id).then(() => {
      setOpen(false)
    })
  }

  return <>
    <Dialog open={open && isEditing} onOpenChange={(v) => {
      setOpen(true);
      setIsEditing(v);
    }}>
      <DialogContent className="sm:max-w-lg p-5 max-h-9/10 overflow-y-scroll overflow-x-clip [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between pb-1">
          <DialogTitle className="text-xl font-semibold">아카이브 수정</DialogTitle>
          <CloseButton />
        </DialogHeader>
        <ArchiveItemForm
          defaultValues={{
            title: item.title,
            description: item.description ?? undefined,
            publishedAt: item.published_at,
            sources: item.sources,
            selectedTagIds: item.tags.map((t) => t.id),
          }}
          onSubmit={async (data) => {
            await updatePostArchiveItem.mutateAsync({
              id: item.id,
              title: data.title,
              description: data.description,
              published_at: data.publishedAt,
              sources: data.sources,
              tag_ids: data.selectedTagIds,
            })
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      </DialogContent>
    </Dialog>
    <Dialog open={open && !isEditing} onOpenChange={(v) => {
      setOpen(v);
      if (!v) setIsEditing(false);
    }}>
      <DialogTrigger render={<ArchiveListItemCard item={item} onClick={() => setOpen(true)} />} />
      { isAdmin ? <ArchivePopup item={item} onEdit={() => setIsEditing(true)} onDelete={handleDelete} /> : <ArchivePopup item={item} onEdit={null} onDelete={null} /> }
    </Dialog>
  </>
}