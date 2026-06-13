import { AlertCircle, Car, Clock, MapPin, Phone, Route } from "lucide-react";
import { GuestPage, PageHero } from "@/components/site-shell";
import { googleCalendarUrl } from "@/lib/calendar";
import { formatTimeForDisplay } from "@/lib/event-time";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function DayOfPage() {
  const [events, settings] = await Promise.all([
    prisma.event.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.siteSetting.findMany(),
  ]);
  const setting = Object.fromEntries(settings.map((item) => [item.key, item.value]));
  const primary = events.find((event) => event.slug === "ceremony") || events[0];
  return (
    <GuestPage>
      <PageHero eyebrow="Day-of mode" title="Wedding day details" copy="The fastest place for schedule, maps, parking, shuttle notes, and day-of contact information." />
      <section className="py-8 sm:py-10">
        <div className="container grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="section-frame dark-panel overflow-hidden">
            <img src="/photos/andre-bebe-portrait.jpg" alt="" loading="lazy" decoding="async" className="h-64 w-full object-cover opacity-80 sm:h-80" />
            <div className="p-5 sm:p-6">
              <p className="script text-3xl leading-tight sm:text-4xl">Today&apos;s essentials</p>
              <div className="mt-5 grid gap-3 text-sm text-[#f4e8dc]">
                <p className="flex gap-3"><Clock className="text-[#d6af78]" size={18} /> Please arrive by 4:40 PM.</p>
                <p className="flex gap-3"><Phone className="text-[#d6af78]" size={18} /> Emergency contact: {setting.dayOfContact || setting.contactEmail || "andrerowell@outlook.com"}</p>
                <p className="flex gap-3"><AlertCircle className="text-[#d6af78]" size={18} /> Check this page first for timing changes.</p>
              </div>
            </div>
          </aside>
          <div className="grid gap-4">
            {events.map((event) => (
              <article key={event.id} className="section-frame p-5">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9b7039]">{formatDate(event.date)} · {formatTimeForDisplay(event.startTime)}</p>
                <h2 className="serif mt-1 text-2xl font-semibold uppercase tracking-[0.06em] sm:text-3xl sm:tracking-[0.08em]">{event.title}</h2>
                <p className="mt-2 text-sm text-[#6d625b]">
                  {event.venueName} · {event.venueName.includes("TBD") || event.city === "TBD" ? "Location to be announced" : `${event.addressLine1}, ${event.city}, ${event.state}`}
                </p>
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <p><Car className="mb-2 text-[#9b7039]" />{event.parkingInfo || "Parking details coming soon."}</p>
                  <p><Route className="mb-2 text-[#9b7039]" />{event.transportationInfo || "Transportation details coming soon."}</p>
                  <p><MapPin className="mb-2 text-[#9b7039]" />{event.mapUrl ? <a className="font-bold underline" href={event.mapUrl} target="_blank" rel="noreferrer">Open map</a> : "Map coming soon."}</p>
                </div>
                <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                  <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className="btn btn-primary">Google calendar</a>
                  <a href={`/api/calendar/${event.id}`} className="btn btn-secondary">Apple calendar</a>
                </div>
              </article>
            ))}
          </div>
        </div>
        {primary ? <div className="container mt-5"><a href={primary.mapUrl || "#"} className="btn btn-primary w-full">Open primary venue map</a></div> : null}
      </section>
    </GuestPage>
  );
}
