
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cleanUrl, isInstagramUrl, isXUrl } from "@/utils/url"
import { useState } from "react"
import type { Source } from "@/components/archive/archiveForm"
import { InstagramLogo } from "@/components/icons/instagram"
import { XLogo } from "@/components/icons/x"
import { TZDate } from "@date-fns/tz"

const supportedPlatforms = [
  {
    name: "Instagram",
    icon: <InstagramLogo />,
  },
  {
    name: "Twitter",
    icon: <XLogo />,
  },
]

export interface QuickImportValues {
  description: string
  publishedAt: TZDate
  sources: Source[]
}

interface QuickImportDialogProps {
  onClose: () => void;
  open: boolean;
  onImport: (values: QuickImportValues) => void;
}

export function QuickImportDialog({ onClose, open, onImport }: QuickImportDialogProps) {
  const [isParsing, setIsParsing] = useState(false)
  const [quickUrl, setQuickUrl] = useState("")

  async function handleQuickImport() {
    let description = ""
    let publishedAt = new TZDate()
    let sources: Source[] = []
    const url = cleanUrl(quickUrl.trim())
    if (!url) return

    const isInsta = isInstagramUrl(url)
    const isX = isXUrl(url)

    if (isInsta || isX) {
      setIsParsing(true)
      try {
        const endpoint = isInsta ? "/api/parse-instagram" : "/api/parse-x"
        const res = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`)
        if (res.ok) {
          const data: { caption?: string; timestamp?: string } = await res.json()
          if (data.caption) description = data.caption
          if (data.timestamp) {
            const d = new TZDate(data.timestamp)
            if (!isNaN(d.getTime())) {
              publishedAt = d
            }
          }
        }
      } finally {
        setIsParsing(false)
      }
    }

    const sourceName = isInsta ? "Instagram" : isX ? "X" : "Link"
    sources = [{ id: null, name: sourceName, url }]
    onImport({
      description,
      publishedAt,
      sources: sources,
    })
    onClose()
  }

  return (
    <Dialog open={open}>
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
            <div className="flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">
              <span>지원 플랫폼:</span>
              {supportedPlatforms.map((platform) => (
                <span
                  key={platform.name}
                  className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-1.5 py-0.5 font-medium text-foreground"
                >
                  {platform.icon}
                  {platform.name}
                </span>
              ))}
            </div>
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