import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePostArchiveItem } from "@/api/mutations/insertItem"
import { QuickImportDialog, type QuickImportValues } from "@/components/archive/quickImport"
import { type ArchiveItemFormValues, ArchiveItemForm } from "@/components/archive/archiveForm"

export function CreateArchiveItemDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const postArchiveItem = usePostArchiveItem()
  const [quickImportValues, setQuickImportValues] = useState<QuickImportValues | null>(null)

  async function handleSubmit(data: ArchiveItemFormValues) {
    await postArchiveItem.mutateAsync({
      title: data.title,
      description: data.description || null,
      published_at: data.publishedAt,
      sources: data.sources,
      tag_ids: data.selectedTagIds,
    })
    setOpen(false)
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger>
          {children}
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg p-5 max-h-9/10 overflow-y-scroll overflow-x-clip">
          <DialogHeader className="flex flex-row items-center pb-1">
            <DialogTitle className="text-xl font-semibold">아카이브 추가</DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false)
                setImportDialogOpen(true)
              }}
            >
              빠른 가져오기
            </Button>
          </DialogHeader>

          <ArchiveItemForm
            defaultValues={quickImportValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <QuickImportDialog
        onClose={() => {
          setImportDialogOpen(false)
          setOpen(true)
        }}
        open={importDialogOpen}
        onImport={(values: QuickImportValues) => setQuickImportValues(values)}
      />
    </>
  )
}