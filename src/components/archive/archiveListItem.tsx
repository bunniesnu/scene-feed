import { Card, CardContent } from "@/components/ui/card"

interface ArchiveItemProps {
  item: {
    id: string
    title: string
    publishedAt: string
  }
}

export function ArchiveListItem({ item }: ArchiveItemProps) {
  return (
    <Card className="p-4">
      <CardContent className="flex items-center justify-between p-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.title}</span>
          </div>
          <p className="text-xs text-muted-foreground">{item.publishedAt}</p>
        </div>
      </CardContent>
    </Card>
  )
}