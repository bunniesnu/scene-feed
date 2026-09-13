import { format } from "date-fns"
import { TZDate } from "@date-fns/tz"

export function getTodayRange() {
  const now = new TZDate();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const date = formatter.format(now);

  const start = new TZDate(`${date}T00:00:00+09:00`);
  const end = new TZDate(`${date}T00:00:00+09:00`);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export function toLocalInput(tzDate: TZDate): string {
  return format(tzDate, "yyyy-MM-dd'T'HH:mm")
}

export function fromLocalInput(
  localInput: string,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
): TZDate {
  // Append seconds to ensure strict ISO-8601 parsing across all runtimes
  return new TZDate(`${localInput}:00`, timeZone)
}