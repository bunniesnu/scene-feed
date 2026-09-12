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
import { supabase } from "@/lib/supabase"

export function CreateArchiveItemDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("archive_items")
        .insert(archiveItem)

      if (error) {
        console.error("Failed to insert archive item:", error)
        return
      }
      form.reset()
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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