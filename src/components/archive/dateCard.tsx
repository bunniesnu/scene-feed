import { format, addDays, subDays } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateNavCardProps {
  date: Date
  onDateChange: (date: Date) => void
  count?: number
}

export function DateNavCard({ date, onDateChange, count = 0 }: DateNavCardProps) {
  const isToday = new Date().toDateString() === date.toDateString()

  return (
    <Card className="p-4">
      <CardContent className="flex items-center justify-between p-0">
        <div className="flex flex-col">
          <Popover>
            <PopoverTrigger>
              <Button variant="ghost" className="gap-2 text-base font-semibold">
                <CalendarIcon className="h-4 w-4" />
                {format(date, "PPP")}
                {isToday && <span className="text-xs text-muted-foreground">(Today)</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && onDateChange(d)}
              />
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground pl-3">{count} archived</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(subDays(date, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(addDays(date, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}