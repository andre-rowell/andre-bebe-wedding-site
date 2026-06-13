import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, Car, ClipboardList, MapPin, MessageSquareHeart } from "lucide-react";
import { GuestPage } from "@/components/site-shell";
import { googleCalendarUrl } from "@/lib/calendar";
import { rsvpConfirmationTemplate } from "@/lib/email-templates";
import { formatTimeForDisplay } from "@/lib/event-time";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function InviteLandingPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams?: Promise<{ submitted?: string }> }) {
  const { token } = await params;
  const query = await searchParams;
  const household = await prisma.household.findUnique({
    where: { inviteLinkToken: token },
    include: {
      guests: { include: { rsvps: { include: { event: true }, orderBy: { updatedAt: "desc" } } } },
      eventInvitations: { include: { event: true, guest: true } },
    },
  });
  if (!household) notFound();

  await prisma.household.update({ where: { id: household.id }, data: { invitationStatus: household.invitationStatus === "NOT_SENT" ? "OPENED" : household.invitationStatus } });

  const events = [...new Map(household.eventInvitations.filter((invite) => invite.invited && invite.event.isActive).map((invite) => [invite.event.id, invite.event])).values()].sort((a, b) => a.sortOrder - b.sortOrder);
  const confirmation = rsvpConfirmationTemplate(household);
  const attendingCount = household.guests.reduce((count, guest) => count + guest.rsvps.filter((rsvp) => rsvp.attending === "YES").length, 0);

  return (
    <GuestPage>
      <section className="relative overflow-hidden bg-[#15110f] py-12 text-white sm:py-24">
        <img src="/photos/andre-bebe-car.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-42" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#15110f]/94 via-[#15110f]/76 to-[#15110f]/46" />
        <div className="container animate-in relative max-w-5xl">
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[#d6af78] sm:text-[0.72rem] sm:tracking-[0.28em]">Private invitation</p>
          <h1 className="serif mt-3 max-w-3xl text-4xl font-semibold leading-none sm:text-8xl">Welcome, {household.name}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#f1e4d6] sm:text-lg sm:leading-8">Your household invitation hub for RSVP, invited events, calendar links, travel details, and wedding weekend updates.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/rsvp?code=${encodeURIComponent(household.inviteCode)}`} className="btn bg-[#fffaf4] text-[#211915] hover:bg-white">RSVP or update</Link>
            <Link href={`/events?code=${encodeURIComponent(household.inviteCode)}`} className="btn border border-white/40 text-white">View invited events</Link>
          </div>
          {query?.submitted ? <p className="mt-6 max-w-xl bg-white/12 p-4 text-sm font-semibold backdrop-blur">Your RSVP was saved. The confirmation copy below is ready for email or manual sending.</p> : null}
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="container grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="section-frame p-5 sm:p-6">
            <h2 className="serif text-3xl font-semibold">Your party</h2>
            <div className="mt-4 grid gap-3">
              {household.guests.map((guest) => (
                <div key={guest.id} className="border-b border-[#e7dbce] pb-3">
                  <p className="font-bold">{guest.firstName} {guest.lastName}</p>
                  <p className="text-sm text-[#6d625b]">{guest.isChild ? "Child" : "Adult"}{guest.plusOneAllowed ? " · Plus-one eligible" : ""}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#fffdf9] p-4">
                <p className="serif text-4xl font-semibold">{events.length}</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em]">events</p>
              </div>
              <div className="bg-[#fffdf9] p-4">
                <p className="serif text-4xl font-semibold">{attendingCount}</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em]">yes RSVPs</p>
              </div>
            </div>
          </aside>

          <div className="grid gap-5">
            {events.map((event) => (
              <article key={event.id} className="section-frame p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9b7039]">{event.type}</p>
                    <h2 className="serif mt-1 text-2xl font-semibold uppercase tracking-[0.06em] sm:text-3xl sm:tracking-[0.08em]">{event.title}</h2>
                    <p className="mt-2 text-sm font-semibold">{formatDate(event.date)} · {formatTimeForDisplay(event.startTime)}</p>
                    <p className="text-sm text-[#6d625b]">
                      {event.venueName} · {event.venueName.includes("TBD") || event.city === "TBD" ? "Location to be announced" : event.addressLine1}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:flex sm:flex-wrap">
                    <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className="btn btn-primary"><CalendarPlus size={16} /> Google</a>
                    <a href={`/api/calendar/${event.id}`} className="btn btn-secondary"><CalendarPlus size={16} /> Apple</a>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[#5c4e48] sm:grid-cols-3">
                  <p><MapPin className="mb-2 text-[#9b7039]" size={18} />{event.mapUrl ? <a className="font-bold underline" href={event.mapUrl} target="_blank" rel="noreferrer">Open map</a> : "Map coming soon"}</p>
                  <p><Car className="mb-2 text-[#9b7039]" size={18} />{event.parkingInfo || "Parking details coming soon."}</p>
                  <p><ClipboardList className="mb-2 text-[#9b7039]" size={18} />{event.rsvpRequired ? "Please RSVP through your invite." : "No RSVP required."}</p>
                </div>
              </article>
            ))}
            <section className="section-frame p-5">
              <div className="flex items-start gap-3">
                <MessageSquareHeart className="mt-1 text-[#9b7039]" />
                <div>
                  <h2 className="serif text-3xl font-semibold">Email-ready confirmation</h2>
                  <p className="mt-2 text-sm text-[#6d625b]">This is generated from the RSVP data currently on file.</p>
                </div>
              </div>
              <div className="dark-panel mt-4 max-w-full overflow-x-auto p-4 text-sm leading-7 text-[#f4e8dc]">
                <p className="font-bold">{confirmation.subject}</p>
                <pre className="mt-3 whitespace-pre-wrap font-sans">{confirmation.body}</pre>
              </div>
            </section>
          </div>
        </div>
      </section>
    </GuestPage>
  );
}
