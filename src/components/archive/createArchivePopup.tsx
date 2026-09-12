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

export function CreateArchiveItemDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

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
          <DialogTitle>Add archive item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter a title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="published_at">Published at</Label>
            <Input
              id="published_at"
              name="published_at"
              type="datetime-local"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source_name">Source</Label>
              <Input
                id="source_name"
                name="source_name"
                placeholder="e.g. X, YouTube"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_url">Source URL</Label>
              <Input
                id="source_url"
                name="source_url"
                type="url"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Tags</Label>

            <div className="space-y-4">
              {Object.entries(
                tags.reduce<Record<string, typeof tags>>((groups, tag) => {
                  ;(groups[tag.category] ??= []).push(tag)
                  return groups
                }, {}),
              ).map(([category, categoryTags]) => (
                <div key={category} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {category}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {categoryTags.map((tag) => {
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
              ))}
            </div>
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