import Link from "next/link";
import { CalendarPlus, MapPin } from "lucide-react";
import { GuestPage, PageHero } from "@/components/site-shell";
import { googleCalendarUrl } from "@/lib/calendar";
import { formatEventTimeRange, hasKnownTime } from "@/lib/event-time";
import { prisma } from "@/lib/prisma";

function eventImage(slug: string, index: number) {
  if (slug.includes("ceremony")) return "/photos/bebe-veil-car-bw.jpg";
  if (slug.includes("reception")) return "/photos/andre-bebe-car-laugh.jpg";
  if (slug.includes("cookout")) return "/photos/andre-bebe-car-embrace.jpg";
  const images = ["/photos/andre-bebe-car.jpg", "/photos/andre-bebe-close.jpg", "/photos/bebe-foreground.jpg"];
  return images[index % images.length];
}

export default async function EventsPage({ searchParams }: { searchParams?: Promise<{ code?: string }> }) {
  const params = await searchParams;
  const household = params?.code
    ? await prisma.household.findFirst({
        where: { OR: [{ inviteCode: params.code.toUpperCase() }, { inviteLinkToken: params.code }] },
        include: { eventInvitations: { include: { event: true } } },
      })
    : null;
  const publicEvents = await prisma.event.findMany({ where: { isActive: true, visibility: "PUBLIC" }, orderBy: { sortOrder: "asc" } });
  const invitedEvents = household?.eventInvitations.map((invite) => invite.event).filter((event) => event.isActive) || [];
  const eventMap = new Map([...publicEvents, ...invitedEvents].map((event) => [event.id, event]));
  const events = [...eventMap.values()].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <GuestPage>
      <PageHero eyebrow="Wedding weekend" title="Events" copy="We can't wait to celebrate with you. Private and invite-only events appear when you arrive through your household invitation." />
      <section className="py-10">
        <div className="container max-w-6xl">
          <div className="ruled-list">
          {events.map((event, index) => (
            <article key={event.id} className="grid min-w-0 gap-5 py-8 md:grid-cols-[5.5rem_minmax(10rem,14rem)_minmax(0,1fr)] md:items-start">
              <div className="date-lockup-center text-left md:text-center">
                <p className="fine-print text-[#9b7039]">{event.date.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Chicago" })}</p>
                <p className="serif mt-1 text-5xl font-semibold leading-none">{event.date.toLocaleDateString("en-US", { day: "2-digit", timeZone: "America/Chicago" })}</p>
                <p className="fine-print mt-1">{event.date.toLocaleDateString("en-US", { month: "short", timeZone: "America/Chicago" })}</p>
              </div>
              <div className="image-frame h-52 md:h-48">
                <img src={eventImage(event.slug, index)} alt="" loading="lazy" decoding="async" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="eyebrow">{formatEventTimeRange(event.startTime, event.endTime)}</p>
                <h2 className="serif mt-2 text-3xl font-semibold uppercase leading-[0.95] tracking-[0.08em] sm:text-4xl">{event.title}</h2>
                <p className="mt-3 text-sm font-semibold">{event.venueName}</p>
                <p className="text-sm leading-6 text-[#6d625b]">
                  {event.venueName.includes("TBD") || event.city === "TBD" ? "Location to be announced" : `${event.addressLine1}, ${event.city}, ${event.state}`}
                </p>
                <div className="mt-4 space-y-2 text-[0.96rem] leading-7 text-[#5c4e48]">
                  <p>{event.description}</p>
                  {event.dressCode ? <p><strong>Dress code:</strong> {event.dressCode}</p> : null}
                  {event.parkingInfo ? <p><strong>Parking:</strong> {event.parkingInfo}</p> : null}
                  {event.transportationInfo ? <p><strong>Transportation:</strong> {event.transportationInfo}</p> : null}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {event.mapUrl ? <a className="btn btn-secondary" href={event.mapUrl} target="_blank" rel="noreferrer"><MapPin size={15} /> Map</a> : null}
                  {hasKnownTime(event.startTime) ? (
                    <>
                      <a className="btn btn-primary" href={googleCalendarUrl(event)} target="_blank" rel="noreferrer"><CalendarPlus size={15} /> Google calendar</a>
                      <a className="btn btn-secondary" href={`/api/calendar/${event.id}`}>Apple calendar</a>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
          </div>
          {!household ? (
            <div className="mt-10 border-y border-[#cbb89f] py-8 text-center">
              <h2 className="serif text-3xl font-semibold uppercase tracking-[0.08em]">Looking for a private event?</h2>
              <p className="mt-2 text-sm text-[#6d625b]">Use your invitation on the RSVP page to see exactly which events your household is invited to.</p>
              <Link href="/rsvp" className="btn btn-primary mt-5">Find my invitation</Link>
            </div>
          ) : null}
        </div>
      </section>
    </GuestPage>
  );
}
