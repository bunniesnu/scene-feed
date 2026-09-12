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
import { usePostTag } from "@/api/mutations/insertTag"
import { useTags } from "@/api/queries/tags"
import { TAG_CATEGORIES, TAG_LABEL, type TagCategory } from "@/constants/tags"

interface Source {
  name: string
  url: string
}

function isInstagramUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr)
    return (
      (parsed.hostname === "instagram.com" || parsed.hostname.endsWith(".instagram.com")) &&
      /^\/(p|reel|tv|stories)\/[\w-]+/.test(parsed.pathname)
    )
  } catch {
    return false
  }
}

export function CreateArchiveItemDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [activeTagCategory, setActiveTagCategory] = useState<TagCategory>("member")
  const [sources, setSources] = useState<Source[]>([{ name: "", url: "" }])
  const [newTagName, setNewTagName] = useState("")
  const [quickUrl, setQuickUrl] = useState("")
  const [description, setDescription] = useState("")
  const [publishedAt, setPublishedAt] = useState("")

  const { data: tags = [] } = useTags()
  const postArchiveItem = usePostArchiveItem()
  const postTag = usePostTag()

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    )
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

  function addSource() {
    setSources((current) => [...current, { name: "", url: "" }])
  }

  function removeSource(index: number) {
    setSources((current) => current.filter((_, i) => i !== index))
  }

  function resetForm() {
    setSelectedTagIds([])
    setSources([{ name: "", url: "" }])
    setNewTagName("")
    setQuickUrl("")
    setDescription("")
    setPublishedAt("")
  }

  async function handleQuickImport() {
    const url = quickUrl.trim()
    if (!url) return

    if (isInstagramUrl(url)) {
      setIsParsing(true)
      try {
        const res = await fetch("/api/parse-instagram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        if (res.ok) {
          const data: { caption?: string; timestamp?: string } = await res.json()
          if (data.caption) setDescription(data.caption)
          if (data.timestamp) {
            const d = new Date(data.timestamp)
            if (!isNaN(d.getTime())) {
              setPublishedAt(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
            }
          }
        }
      } finally {
        setIsParsing(false)
      }
    }

    setSources([{ name: isInstagramUrl(url) ? "Instagram" : "Link", url }])
    setImportDialogOpen(false)
    setOpen(true)
  }

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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const archiveItem = {
      title: formData.get("title") as string,
      description: description || null,
      published_at: new Date(publishedAt).toISOString(),
      sources: sources.filter(
        (source) => source.name.trim() || source.url.trim(),
      ),
      tag_ids: selectedTagIds,
    }

    setIsSubmitting(true)
    try {
      await postArchiveItem.mutateAsync(archiveItem)

      form.reset()
      resetForm()
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)

    if (!value && !importDialogOpen) {
      resetForm()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger>
          {children}
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg p-5 max-h-9/10 overflow-y-scroll overflow-x-clip">
          <DialogHeader className="flex flex-row items-center justify-between pb-1">
            <DialogTitle className="text-xl font-semibold">아카이브 추가</DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false)
                setQuickUrl(sources[0]?.url || "")
                setImportDialogOpen(true)
              }}
            >
              빠른 가져오기
            </Button>
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
                value={publishedAt}
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

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md p-5">
          <DialogHeader>
            <DialogTitle>빠른 링크 가져오기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="quick-url">인스타그램 링크</Label>
              <Input
                id="quick-url"
                type="url"
                placeholder="https://www.instagram.com/p/..."
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void handleQuickImport()
                  }
                }}
                disabled={isParsing}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setImportDialogOpen(false)
                  setOpen(true)
                }}
                disabled={isParsing}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={() => void handleQuickImport()}
                disabled={!quickUrl.trim() || isParsing}
              >
                {isParsing ? "불러오는 중..." : "가져오기"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}