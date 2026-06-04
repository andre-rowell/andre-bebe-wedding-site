export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(date);
}

export function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00-05:00`).getTime();
  const today = Date.now();
  return Math.max(0, Math.ceil((target - today) / 86_400_000));
}

export function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
