import type { Event } from "@prisma/client";
import { chicagoDateInputValue, dateAtChicagoTime, minutesBetween } from "@/lib/event-time";

function compactDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function eventStart(event: Event) {
  return dateAtChicagoTime(chicagoDateInputValue(event.date), event.startTime);
}

function eventEnd(event: Event) {
  const start = eventStart(event);
  if (!event.endTime) return new Date(start.getTime() + minutesBetween(event.startTime, event.endTime) * 60 * 1000);
  const end = dateAtChicagoTime(chicagoDateInputValue(event.date), event.endTime);
  if (end <= start) end.setDate(end.getDate() + 1);
  return end;
}

export function googleCalendarUrl(event: Event) {
  const start = compactDate(eventStart(event));
  const end = compactDate(eventEnd(event));
  const location = `${event.venueName}, ${event.addressLine1}, ${event.city}, ${event.state}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(location)}`;
}

export function icsForEvent(event: Event) {
  const start = compactDate(eventStart(event));
  const end = compactDate(eventEnd(event));
  const location = `${event.venueName}, ${event.addressLine1}, ${event.city}, ${event.state}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Andre Bebe Wedding//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@andre-bebe-wedding`,
    `DTSTAMP:${compactDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replaceAll("\n", "\\n")}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
