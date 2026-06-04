export function timeInputValue(time?: string | null) {
  if (!time || time.toUpperCase() === "TBD") return "";
  const twentyFourHour = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourHour) return `${twentyFourHour[1].padStart(2, "0")}:${twentyFourHour[2]}`;

  const twelveHour = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!twelveHour) return "";
  let hour = Number(twelveHour[1]);
  const minute = twelveHour[2] || "00";
  const meridiem = twelveHour[3].toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export function formatTimeForDisplay(time?: string | null) {
  const value = timeInputValue(time);
  if (!value) return time || "TBD";
  const [hourText, minute] = value.split(":");
  let hour = Number(hourText);
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${meridiem}`;
}

export function chicagoDateInputValue(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function dateAtChicagoTime(date: string, time?: string | null) {
  const normalizedTime = timeInputValue(time) || "12:00";
  return new Date(`${date}T${normalizedTime}:00-05:00`);
}

export function minutesBetween(start?: string | null, end?: string | null) {
  const startValue = timeInputValue(start);
  const endValue = timeInputValue(end);
  if (!startValue || !endValue) return 120;
  const [startHour, startMinute] = startValue.split(":").map(Number);
  const [endHour, endMinute] = endValue.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;
  if (endTotal <= startTotal) endTotal += 24 * 60;
  return Math.max(15, endTotal - startTotal);
}
