import type { Event } from "@prisma/client";
import { minutesBetween } from "@/lib/event-time";

function compactDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(event: Event) {
  const start = compactDate(event.date);
  const end = compactDate(new Date(event.date.getTime() + minutesBetween(event.startTime, event.endTime) * 60 * 1000));
  const location = `${event.venueName}, ${event.addressLine1}, ${event.city}, ${event.state}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(location)}`;
}

export function icsForEvent(event: Event) {
  const start = compactDate(event.date);
  const end = compactDate(new Date(event.date.getTime() + minutesBetween(event.startTime, event.endTime) * 60 * 1000));
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
