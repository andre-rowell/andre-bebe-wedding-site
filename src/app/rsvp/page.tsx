import Link from "next/link";
import { CalendarDays, CheckCircle2, LockKeyhole, Mail, Search, UsersRound } from "lucide-react";
import { GuestPage } from "@/components/site-shell";
import { submitRsvpAction } from "@/lib/actions";
import { formatTimeForDisplay } from "@/lib/event-time";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function RsvpPage({ searchParams }: { searchParams?: Promise<{ code?: string; q?: string; submitted?: string; error?: string }> }) {
  const params = await searchParams;
  const query = (params?.code || params?.q || "").trim();
  const ceremony = await prisma.event.findFirst({ where: { slug: "ceremony", isActive: true } });
  const invitationDate = ceremony?.date || new Date("2027-05-30T22:00:00.000Z");
  const invitationWeekday = invitationDate.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Chicago" });
  const invitationDay = invitationDate.toLocaleDateString("en-US", { day: "2-digit", timeZone: "America/Chicago" });
  const invitationMonthYear = invitationDate.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "America/Chicago" });
  const invitationLongDate = invitationDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" });
  const household = query
    ? await prisma.household.findFirst({
        where: {
          OR: [
            { inviteCode: query.toUpperCase() },
            { inviteLinkToken: query },
            { name: { contains: query } },
            { primaryEmail: { contains: query } },
            { guests: { some: { OR: [{ firstName: { contains: query } }, { lastName: { contains: query } }, { email: { contains: query } }] } } },
          ],
        },
        include: {
          guests: { orderBy: [{ isAdult: "desc" }, { firstName: "asc" }] },
          eventInvitations: { include: { event: true } },
          rsvps: true,
        },
      })
    : null;

  const rsvpByGuestEvent = new Map(household?.rsvps.map((rsvp) => [`${rsvp.guestId}:${rsvp.eventId}`, rsvp]) || []);
  const invitedEventCount = household
    ? new Set(household.eventInvitations.filter((invite) => invite.invited && invite.event.isActive).map((invite) => invite.eventId)).size
    : 0;

  return (
    <GuestPage>
      <section className="relative overflow-hidden bg-[#15110f] text-[#fffaf4]">
        <img src="/photos/andre-bebe-car.jpg" alt="" fetchPriority="high" className="hero-photo absolute inset-0 h-full w-full object-cover opacity-24" />
        <div className="absolute inset-0 bg-[#15110f]/72" />
        <div className="wide-container relative grid min-h-[calc(100vh-4.25rem)] gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-12">
          <aside className="animate-in">
            <p className="eyebrow text-[#d6ae76]">Save the date</p>
            <h1 className="serif mt-5 max-w-xl text-6xl font-semibold uppercase leading-[0.88] tracking-[0.08em] text-white sm:text-8xl">
              Andre
              <span className="script block text-[#d6ae76]">&</span>
              Bebe
            </h1>
            <div className="mt-8 grid max-w-lg grid-cols-3 border-y border-white/18 py-5 text-center">
              <p className="fine-print text-[#ead9c6]">{invitationWeekday}</p>
              <p className="serif text-4xl font-semibold text-white">{invitationDay}</p>
              <p className="fine-print text-[#ead9c6]">{invitationMonthYear}</p>
            </div>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#eadfd4]">
              Open your household invitation to respond for each guest and each event. Private events only appear when they belong to your invitation.
            </p>
          </aside>

          <div className="paper-panel animate-fade grid overflow-hidden text-[#211915] lg:grid-cols-[0.88fr_1.12fr]">
            <div className="relative min-h-[25rem] bg-[#241b17]">
              <img src="/photos/andre-bebe-portrait.jpg" alt="Andre and Bebe engagement portrait" className="absolute inset-0 h-full w-full object-cover object-[58%_36%] opacity-82" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#15110f]/84 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <p className="eyebrow text-[#d6ae76]">Invitation</p>
                <p className="serif mt-2 text-4xl font-semibold uppercase tracking-[0.08em]">{invitationLongDate}</p>
                <p className="mt-2 text-sm text-[#f1e4d6]">Urban Daisy / Minneapolis, MN</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-[#d8c8b7] bg-[#fbf2e7]">
                  <LockKeyhole size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="eyebrow">Find your invitation</p>
                  <h2 className="serif text-3xl font-semibold">Enter your name or invite code</h2>
                </div>
              </div>

              <form className="mt-6 space-y-4" action="/rsvp">
                <div>
                  <label htmlFor="q">Name, email, household, or invitation code</label>
                  <input id="q" name="q" defaultValue={query} placeholder="Example: ROWELL2026" autoComplete="name" />
                </div>
                <button className="btn btn-primary w-full">
                  <Search size={16} aria-hidden="true" />
                  Open invitation
                </button>
              </form>

              {query && !household ? (
                <p className="mt-4 border border-[#e5b5aa] bg-[#fff1ec] p-3 text-sm font-semibold text-[#7c352f]">
                  We could not find that invitation. Check the spelling or use the invite code exactly as it appears.
                </p>
              ) : null}
              {params?.submitted ? (
                <p className="mt-4 border border-[#b9d8b5] bg-[#edf6ec] p-3 text-sm font-semibold text-[#315f32]">
                  Thank you. Your RSVP has been saved and can be updated before the deadline.
                </p>
              ) : null}

              <div className="mt-6 grid gap-3 text-sm leading-6 text-[#5f5149] sm:grid-cols-3">
                <p><UsersRound className="mb-2 text-[#9a6932]" size={18} />Household based</p>
                <p><CalendarDays className="mb-2 text-[#9a6932]" size={18} />Event specific</p>
                <p><Mail className="mb-2 text-[#9a6932]" size={18} />Update anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {household ? (
        <section className="editorial-band py-12 sm:py-16">
          <div className="container">
            <div className="paper-panel p-6 sm:p-8">
              <div className="grid gap-6 border-b border-[#ded2c4] pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="eyebrow">{household.inviteCode}</p>
                  <h2 className="serif mt-2 text-5xl font-semibold uppercase leading-none tracking-[0.08em]">{household.name}</h2>
                  <p className="mt-4 max-w-2xl leading-7 text-[#5f5149]">
                    Respond for each person in your household. You will only see the events each guest is invited to attend.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="border border-[#ded2c4] bg-[#fffdf9] p-4">
                    <p className="serif text-4xl font-semibold">{household.guests.length}</p>
                    <p className="fine-print">guests</p>
                  </div>
                  <div className="border border-[#ded2c4] bg-[#fffdf9] p-4">
                    <p className="serif text-4xl font-semibold">{invitedEventCount}</p>
                    <p className="fine-print">events</p>
                  </div>
                </div>
              </div>

              <form action={submitRsvpAction} className="mt-8">
                <input type="hidden" name="householdId" value={household.id} />
                <div className="grid gap-6">
                  {household.guests.map((guest) => {
                    const invitations = household.eventInvitations
                      .filter((invite) => invite.guestId === guest.id && invite.invited && invite.event.isActive)
                      .sort((a, b) => a.event.sortOrder - b.event.sortOrder);

                    return (
                      <section key={guest.id} className="border border-[#ded2c4] bg-[#fffdf9]">
                        <div className="grid gap-4 border-b border-[#ded2c4] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <p className="fine-print">{guest.isChild ? "Child" : "Adult"}{guest.plusOneAllowed ? " / plus-one eligible" : ""}</p>
                            <h3 className="serif mt-1 text-4xl font-semibold">{guest.firstName} {guest.lastName}</h3>
                          </div>
                          <CheckCircle2 className="text-[#9a6932]" aria-hidden="true" />
                        </div>

                        {guest.plusOneAllowed ? (
                          <div className="border-b border-[#ded2c4] bg-[#fbf2e7] p-5">
                            <label htmlFor={`plusOneName:${guest.id}`}>Plus-one name</label>
                            <input id={`plusOneName:${guest.id}`} name={`plusOneName:${guest.id}`} defaultValue={guest.plusOneName || ""} placeholder="Guest name" />
                            <p className="mt-2 text-xs leading-5 text-[#6b5c51]">Only one plus-one is available because it is included on this invitation.</p>
                          </div>
                        ) : null}

                        <div className="grid gap-5 p-5">
                          {invitations.length ? null : <p className="text-sm text-[#5f5149]">No RSVP-required events are assigned to this guest yet.</p>}
                          {invitations.map((invite) => {
                            const event = invite.event;
                            const existing = rsvpByGuestEvent.get(`${guest.id}:${event.id}`);
                            const mealOptions = (event.mealOptions || "").split("|").filter(Boolean);
                            return (
                              <article key={invite.id} className="border border-[#e2d5c5] bg-[#faf6ef] p-4 sm:p-5">
                                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                                  <div>
                                    <p className="eyebrow">{formatDate(event.date)} / {formatTimeForDisplay(event.startTime)}</p>
                                    <h4 className="serif mt-2 text-3xl font-semibold uppercase tracking-[0.08em]">{event.title}</h4>
                                    <p className="mt-2 text-sm leading-6 text-[#5f5149]">
                                      {event.venueName.includes("TBD") || event.city === "TBD" ? "Location to be announced" : `${event.venueName}, ${event.city}, ${event.state}`}
                                    </p>
                                  </div>
                                  <fieldset aria-label={`${guest.firstName} ${event.title} attendance`}>
                                    <legend className="sr-only">Attendance</legend>
                                    <div className="grid min-w-56 grid-cols-2 gap-2">
                                      {["YES", "NO"].map((choice) => (
                                        <label key={choice} className="mb-0 cursor-pointer">
                                          <input
                                            className="peer sr-only"
                                            type="radio"
                                            name={`attending:${guest.id}:${event.id}`}
                                            value={choice}
                                            defaultChecked={(existing?.attending || "UNANSWERED") === choice}
                                            required
                                          />
                                          <span className="flex min-h-11 items-center justify-center border border-[#cdbfad] bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-[#493c35] peer-checked:border-[#211915] peer-checked:bg-[#211915] peer-checked:text-white">
                                            {choice === "YES" ? "Accepts" : "Declines"}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </fieldset>
                                </div>

                                {event.mealSelectionRequired ? (
                                  <div className="mt-5">
                                    <label htmlFor={`meal:${guest.id}:${event.id}`}>Meal choice</label>
                                    <select id={`meal:${guest.id}:${event.id}`} name={`meal:${guest.id}:${event.id}`} defaultValue={existing?.mealChoice || ""}>
                                      <option value="">Select a meal if attending</option>
                                      {mealOptions.map((meal) => <option key={meal}>{meal}</option>)}
                                    </select>
                                  </div>
                                ) : null}

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <label htmlFor={`dietary:${guest.id}:${event.id}`}>Dietary restrictions</label>
                                    <input id={`dietary:${guest.id}:${event.id}`} name={`dietary:${guest.id}:${event.id}`} defaultValue={existing?.dietaryRestrictions || ""} placeholder="None, vegetarian, allergies..." />
                                  </div>
                                  <div>
                                    <label htmlFor={`accessibility:${guest.id}:${event.id}`}>Accessibility needs</label>
                                    <input id={`accessibility:${guest.id}:${event.id}`} name={`accessibility:${guest.id}:${event.id}`} defaultValue={existing?.accessibilityNeeds || ""} placeholder="Optional" />
                                  </div>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <label htmlFor={`song:${guest.id}:${event.id}`}>Song request</label>
                                    <input id={`song:${guest.id}:${event.id}`} name={`song:${guest.id}:${event.id}`} defaultValue={existing?.songRequest || ""} placeholder="Optional" />
                                  </div>
                                  <div>
                                    <label htmlFor={`travel:${guest.id}:${event.id}`}>Travel or shuttle notes</label>
                                    <input id={`travel:${guest.id}:${event.id}`} name={`travel:${guest.id}:${event.id}`} defaultValue={existing?.travelNotes || ""} placeholder="Optional" />
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-4 border border-[#211915] bg-[#211915] p-5 text-[#fffaf4] lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <h3 className="serif text-4xl font-semibold">Review & submit</h3>
                    <p className="mt-2 text-sm leading-7 text-[#eadfd4]">
                      Submitting updates previous answers for this household instead of creating duplicate RSVP records.
                    </p>
                  </div>
                  <button className="btn bg-[#fffaf4] text-[#211915] hover:bg-white">Submit RSVP</button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="btn btn-secondary" href={`/events?code=${encodeURIComponent(household.inviteCode)}`}>View invited events</Link>
                <Link className="btn btn-secondary" href={`/invite/${household.inviteLinkToken}`}>Private invitation hub</Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </GuestPage>
  );
}
