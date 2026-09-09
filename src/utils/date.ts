export function getTodayRange() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const date = formatter.format(now);

  const start = new Date(`${date}T00:00:00+09:00`);
  const end = new Date(`${date}T00:00:00+09:00`);
  end.setDate(end.getDate() + 1);

  return { start, end };
}