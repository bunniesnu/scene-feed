import { TAG_CATEGORIES, TAG_LABEL, type TagCategory } from "@/constants/tags"
import { useState, type SubmitEvent } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useTags } from "@/api/queries/tags"
import { usePostTag } from "@/api/mutations/insertTag"


export interface Source {
  name: string
  url: string
}

export interface ArchiveItemFormValues {
  title: string
  description: string
  publishedAt: string
  sources: Source[]
  selectedTagIds: string[]
}

export interface ArchiveItemFormProps {
  defaultValues: Partial<ArchiveItemFormValues> | null
  onSubmit: (data: ArchiveItemFormValues) => Promise<void>
  onCancel: () => void
}

export function ArchiveItemForm({
  defaultValues,
  onSubmit,
  onCancel,
}: ArchiveItemFormProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(defaultValues ? (defaultValues.selectedTagIds ? defaultValues.selectedTagIds : []) : [])
  const [activeTagCategory, setActiveTagCategory] = useState<TagCategory>("member")
  const [sources, setSources] = useState<Source[]>(defaultValues ? (defaultValues.sources ? defaultValues.sources : [{ name: "", url: "" }]) : [{ name: "", url: "" }])
  const [newTagName, setNewTagName] = useState("")
  const [description, setDescription] = useState(defaultValues ? (defaultValues.description ? defaultValues.description : "") : "")
  const [publishedAt, setPublishedAt] = useState(defaultValues ? (defaultValues.publishedAt ? defaultValues.publishedAt : "") : "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: tags = [] } = useTags()
  const postTag = usePostTag()

  async function handleCreateTag() {
    const name = newTagName.trim()

    if (!name) {
      return
    }

    const existingTag = tags.find(
      (tag) =>
        tag.category === activeTagCategory &&
        tag.name.toLowerCase() === name.toLowerCase(),
    )

    if (existingTag) {
      if (!selectedTagIds.includes(existingTag.id)) {
        setSelectedTagIds((current) => [...current, existingTag.id])
      }

      setNewTagName("")
      return
    }

    const tag = await postTag.mutateAsync({
      name,
      category: activeTagCategory,
    })

    setSelectedTagIds((current) => [...current, tag.id])
    setNewTagName("")
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    )
  }

  function addSource() {
    setSources((current) => [...current, { name: "", url: "" }])
  }

  function updateSource(index: number, field: keyof Source, value: string) {
    setSources((current) =>
      current.map((source, sourceIndex) =>
        sourceIndex === index
          ? { ...source, [field]: value }
          : source,
      ),
    )
  }

  function removeSource(index: number) {
    setSources((current) => current.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setIsSubmitting(true)

    try {
      await onSubmit({
        title: formData.get("title") as string,
        description,
        publishedAt: new Date(publishedAt).toISOString(),
        sources: sources.filter(
          (source) => source.name.trim() || source.url.trim(),
        ),
        selectedTagIds,
      })
      form.reset()
      onCancel()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaultValues ? (defaultValues.title ? defaultValues.title : "") : ""}
          placeholder="Enter a title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="published_at">날짜/시간</Label>
        <Input
          id="published_at"
          name="published_at"
          value={publishedAt.length > 0 ? new Date(publishedAt).toISOString().slice(0, 16) : ""}
          onChange={(e) => setPublishedAt(e.target.value)}
          type="datetime-local"
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>출처</Label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSource}
          >
            출처 추가
          </Button>
        </div>

        <div className="space-y-3 max-h-32 overflow-y-scroll">
          {sources.map((source, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={source.name}
                onChange={(event) =>
                  updateSource(index, "name", event.target.value)
                }
                placeholder="출처 이름"
              />

              <Input
                value={source.url}
                onChange={(event) =>
                  updateSource(index, "url", event.target.value)
                }
                type="url"
                placeholder="https://..."
              />

              {sources.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSource(index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>태그</Label>

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

        <div className="rounded-md border p-3">
          <div className="max-h-30 overflow-y-scroll">
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

          <div className="mt-3 flex gap-2 border-t pt-3">
            <Input
              value={newTagName}
              onChange={(event) =>
                setNewTagName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  void handleCreateTag()
                }
              }}
              placeholder={`${TAG_LABEL[activeTagCategory]} 태그 추가`}
              disabled={postTag.isPending}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCreateTag()}
              disabled={
                !newTagName.trim() || postTag.isPending
              }
            >
              {postTag.isPending ? "추가 중..." : "추가"}
            </Button>
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
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  )
}