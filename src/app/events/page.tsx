import Link from "next/link";
import { GuestPage, PageHero } from "@/components/site-shell";
import { googleCalendarUrl } from "@/lib/calendar";
import { formatTimeForDisplay } from "@/lib/event-time";
import { prisma } from "@/lib/prisma";

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
        <div className="container max-w-5xl">
          <div className="section-frame grid gap-4 p-4 sm:p-8">
          {events.map((event) => (
            <article key={event.id} className="grid overflow-hidden border border-[#e7dbce] bg-[#fffdf9] md:grid-cols-[0.32fr_0.68fr]">
              <div className="grid grid-cols-[5.5rem_1fr] md:grid-cols-1">
                <div className="flex flex-col items-center justify-center border-r border-[#e7dbce] p-4 text-center md:border-b md:border-r-0">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#9b7039]">{event.date.toLocaleDateString("en-US", { month: "short", timeZone: "America/Chicago" })}</p>
                  <p className="serif text-4xl font-semibold">{event.date.toLocaleDateString("en-US", { day: "2-digit", timeZone: "America/Chicago" })}</p>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#6d625b]">{event.date.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Chicago" })}</p>
                </div>
                <img src={event.slug === "ceremony" ? "/photos/bebe-veil-car-bw.jpg" : event.slug === "reception" ? "/photos/andre-bebe-car-laugh.jpg" : "/photos/andre-bebe-car.jpg"} alt="" loading="lazy" decoding="async" className="h-40 w-full object-cover md:h-full" />
              </div>
              <div className="p-5 sm:p-7">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9b7039]">{formatTimeForDisplay(event.startTime)}{event.endTime ? ` - ${formatTimeForDisplay(event.endTime)}` : ""}</p>
                <h2 className="serif mt-2 text-3xl font-semibold uppercase tracking-[0.08em]">{event.title}</h2>
                <p className="mt-2 text-sm font-semibold">{event.venueName}</p>
                <p className="text-sm text-[#6d625b]">
                  {event.venueName.includes("TBD") || event.city === "TBD" ? "Location to be announced" : `${event.addressLine1}, ${event.city}, ${event.state}`}
                </p>
                <div className="mt-4 space-y-2 text-sm leading-7 text-[#5c4e48]">
                <p>{event.description}</p>
                {event.dressCode ? <p><strong>Dress code:</strong> {event.dressCode}</p> : null}
                {event.parkingInfo ? <p><strong>Parking:</strong> {event.parkingInfo}</p> : null}
                {event.transportationInfo ? <p><strong>Transportation:</strong> {event.transportationInfo}</p> : null}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  {event.mapUrl ? <a className="btn btn-secondary" href={event.mapUrl} target="_blank" rel="noreferrer">Map</a> : null}
                  <a className="btn btn-primary" href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">Google calendar</a>
                  <a className="btn btn-secondary" href={`/api/calendar/${event.id}`}>Apple calendar</a>
                </div>
              </div>
            </article>
          ))}
          </div>
          {!household ? (
            <div className="section-frame mt-5 p-6 text-center">
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
