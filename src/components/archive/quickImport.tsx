
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cleanUrl, isInstagramUrl, isPlusChatUrl, isXUrl, isYouTubeUrl } from "@/utils/url"
import { useState } from "react"
import type { Source } from "@/components/archive/archiveForm"
import { InstagramLogo } from "@/components/icons/instagram"
import { XLogo } from "@/components/icons/x"
import { YouTubeLogo } from "@/components/icons/youtube"
import { PlusChatLogo } from "@/components/icons/pluschat"
import { TZDate } from "@date-fns/tz"

interface SupportedPlatform {
  name: string
  icon: React.ReactNode
  endpoint: string
  parser: (url: string) => boolean
}

const supportedPlatforms: SupportedPlatform[] = [
  {
    name: "Instagram",
    icon: <InstagramLogo />,
    endpoint: "/api/parse-instagram",
    parser: isInstagramUrl,
  },
  {
    name: "Twitter",
    icon: <XLogo />,
    endpoint: "/api/parse-x",
    parser: isXUrl,
  },
  {
    name: "Youtube",
    icon: <YouTubeLogo />,
    endpoint: "/api/parse-youtube",
    parser: isYouTubeUrl,
  },
  {
    name: "PlusChat",
    icon: <PlusChatLogo />,
    endpoint: "/api/parse-pluschat",
    parser: isPlusChatUrl,
  },
]

interface InstagramData {
  caption: string | null
  timestamp: string | null
}

interface XData {
  caption: string
  author: string | null
  authorUrl: string | null
  timestamp: string
}

interface YouTubeData {
  videoId: string
  title: string
  author: string
  channelId: string
  description: string
  timestamp: string
  thumbnails: Record<string, { url: string; width: number; height: number }>
}

interface PlusChatResponse {
  title: string | null;
  caption: string | null;
  author: string | null;
  authorUrl: string | null;
  timestamp: string | null;
  images: string[];
}

type ParsedData = InstagramData | XData | YouTubeData | PlusChatResponse

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
    const url = cleanUrl(quickUrl.trim())
    if (!url) return

    const platform = supportedPlatforms.find(({ parser }) => parser(url))

    if (platform) {
      setIsParsing(true)
      try {
        const res = await fetch(`${platform.endpoint}?url=${encodeURIComponent(url)}`)
        if (res.ok) {
          const data: ParsedData = await res.json()
          if ("caption" in data && "title" in data) {
            description = data.caption ?? data.title ?? ""
          } else if ("caption" in data) {
            description = data.caption ?? ""
          } else if ("title" in data) {
            description = `제목: ${data.title}\n채널: ${data.author}\n\n${data.description}`
          }
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

    onImport({
      description,
      publishedAt,
      sources: [{ id: null, name: platform?.name ?? "Link", url }],
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
            <div className="flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground flex-wrap">
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