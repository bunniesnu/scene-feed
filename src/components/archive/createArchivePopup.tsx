import { useState, type ReactNode, type SubmitEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePostArchiveItem } from "@/api/mutations/insertItem"
import { useTags } from "@/api/queries/tags"
import { TAG_CATEGORIES, TAG_LABEL, type TagCategory } from "@/constants/tags"

export function CreateArchiveItemDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [activeTagCategory, setActiveTagCategory] = useState<TagCategory>("member")

  const { data: tags = [] } = useTags()
  const postArchiveItem = usePostArchiveItem()

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    )
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const archiveItem = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      published_at: new Date(formData.get("published_at") as string).toISOString(),
      source_name: (formData.get("source_name") as string) || null,
      source_url: (formData.get("source_url") as string) || null,
      tag_ids: selectedTagIds,
    }

    setIsSubmitting(true)
    try {
      await postArchiveItem.mutateAsync(archiveItem)

      form.reset()
      setSelectedTagIds([])
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)

    if (!value) {
      setSelectedTagIds([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader>
          <DialogTitle>아카이브 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter a title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="published_at">날짜/시간</Label>
            <Input
              id="published_at"
              name="published_at"
              type="datetime-local"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source_name">출처</Label>
              <Input
                id="source_name"
                name="source_name"
                placeholder="e.g. X, YouTube"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_url">링크</Label>
              <Input
                id="source_url"
                name="source_url"
                type="url"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>태크</Label>

              {selectedTagIds.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {selectedTagIds.length} selected
                </span>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {TAG_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveTagCategory(category)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
                    activeTagCategory === category
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {TAG_LABEL[category]}
                </button>
              ))}
            </div>

            <div className="min-h-20 rounded-md border p-3">
              <div className="flex flex-wrap gap-2">
                {tags
                  .filter((tag) => tag.category === activeTagCategory)
                  .map((tag) => {
                    const selected = selectedTagIds.includes(tag.id)

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
              </div>
            </div>

            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags
                  .filter((tag) => selectedTagIds.includes(tag.id))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs"
                    >
                      {tag.name} ×
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}