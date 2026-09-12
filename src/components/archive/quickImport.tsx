
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isInstagramUrl, isXUrl } from "@/utils/url"
import { useState, type SetStateAction } from "react"
import type { Source } from "@/components/archive/createArchivePopup"

interface QuickImportDialogProps {
  onClose: () => void;
  open: boolean;
  setDescription: (value: SetStateAction<string>) => void;
  setImportDialogOpen: (value: SetStateAction<boolean>) => void;
  setPublishedAt: (value: SetStateAction<string>) => void;
  setSources: (value: SetStateAction<Source[]>) => void;
}

export function QuickImportDialog({ onClose, open, setDescription, setImportDialogOpen, setPublishedAt, setSources }: QuickImportDialogProps) {
  const [isParsing, setIsParsing] = useState(false)
  const [quickUrl, setQuickUrl] = useState("")

  async function handleQuickImport() {
    const url = quickUrl.trim()
    if (!url) return

    const isInsta = isInstagramUrl(url)
    const isX = isXUrl(url)

    if (isInsta || isX) {
      setIsParsing(true)
      try {
        const endpoint = isInsta ? "/api/parse-instagram" : "/api/parse-x"
        const res = await fetch(endpoint, {
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

    const sourceName = isInsta ? "Instagram" : isX ? "X" : "Link"
    setSources([{ name: sourceName, url }])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={setImportDialogOpen}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader>
          <DialogTitle>빠른 링크 가져오기</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="quick-url">링크</Label>
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
              onClick={onClose}
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
  )
}