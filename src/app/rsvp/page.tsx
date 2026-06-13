import Link from "next/link";
import { CalendarDays, CheckCircle2, LockKeyhole, Search, UsersRound, X } from "lucide-react";
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
    <main className="relative min-h-screen overflow-hidden bg-[#15110f] text-[#211915]">
      <img src="/photos/andre-bebe-close.jpg" alt="" fetchPriority="high" className="hero-photo fixed inset-0 h-full w-full object-cover opacity-34" />
      <div className="fixed inset-0 bg-[#15110f]/76" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(214,174,118,0.22),transparent_25rem),radial-gradient(circle_at_82%_20%,rgba(157,95,88,0.16),transparent_24rem)]" />

      <Link
        href="/"
        aria-label="Close RSVP and return to the wedding site"
        className="fixed right-3 top-3 z-30 inline-flex h-12 w-12 items-center justify-center border border-white/18 bg-[#fffaf4] text-[#211915] shadow-2xl hover:bg-white sm:right-6 sm:top-6"
      >
        <X size={20} aria-hidden="true" />
      </Link>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-3 py-4 sm:px-6 sm:py-8" aria-labelledby="rsvp-title">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-title"
          className="animate-fade flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden border border-[#d8c8b7] bg-[#fffaf4] shadow-[0_30px_110px_rgba(0,0,0,0.42)] sm:max-h-[calc(100vh-4rem)]"
        >
          <header className="shrink-0 border-b border-[#ded2c4] bg-[#fffaf4]/96 backdrop-blur">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center border border-[#d8c8b7] bg-[#fbf2e7]">
                    <LockKeyhole size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="eyebrow">{household ? "Invitation found" : "RSVP"}</p>
                    <h1 id="rsvp-title" className="serif mt-2 text-3xl font-semibold uppercase leading-none tracking-[0.08em] text-[#211915] sm:text-4xl">
                      {household ? household.name : "Find your invitation"}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f5149] sm:text-[0.98rem] sm:leading-7">
                      {household
                        ? "Confirm each invitee below. Private events only appear when they are assigned to this household."
                        : "Enter your invitation code, household name, guest name, or email to open your private RSVP."}
                    </p>
                  </div>
                </div>

                <form className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" action="/rsvp#responses" method="get">
                  <div>
                    <label htmlFor="q">Invitation lookup</label>
                    <input
                      id="q"
                      name="q"
                      defaultValue={query}
                      placeholder="Invite code, name, email, or household"
                      autoComplete="name"
                      autoFocus={!household}
                    />
                  </div>
                  <button className="btn btn-primary self-end">
                    <Search size={16} aria-hidden="true" />
                    {household ? "Switch invitation" : "Open invitation"}
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
              </div>

              <aside className="hidden border-l border-[#ded2c4] bg-[#fbf2e7] p-6 lg:block">
                {household ? (
                  <div className="grid h-full content-center gap-4">
                    <p className="fine-print text-[#9a6932]">{household.inviteCode}</p>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="border border-[#ded2c4] bg-[#fffdf9] p-4">
                        <UsersRound className="mx-auto mb-2 text-[#9a6932]" size={18} aria-hidden="true" />
                        <p className="serif text-4xl font-semibold">{household.guests.length}</p>
                        <p className="fine-print">guests</p>
                      </div>
                      <div className="border border-[#ded2c4] bg-[#fffdf9] p-4">
                        <CalendarDays className="mx-auto mb-2 text-[#9a6932]" size={18} aria-hidden="true" />
                        <p className="serif text-4xl font-semibold">{invitedEventCount}</p>
                        <p className="fine-print">events</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full content-center gap-4">
                    <p className="eyebrow">Andre & Bebe</p>
                    <div className="grid grid-cols-3 border-y border-[#d8c8b7] py-4 text-center">
                      <p className="fine-print">{invitationWeekday}</p>
                      <p className="serif text-4xl font-semibold">{invitationDay}</p>
                      <p className="fine-print">{invitationMonthYear}</p>
                    </div>
                    <p className="text-sm leading-6 text-[#5f5149]">Urban Daisy / Minneapolis, MN</p>
                  </div>
                )}
              </aside>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#faf6ef]">
            {household ? (
              <section id="responses" className="scroll-mt-4 p-4 sm:p-6">
                <div className="mb-5 grid gap-4 border border-[#ded2c4] bg-[#fffdf9] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="eyebrow">Your invitees</p>
                    <h2 className="serif mt-1 text-3xl font-semibold uppercase leading-none tracking-[0.08em]">Respond by person</h2>
                    <p className="mt-2 text-sm leading-6 text-[#5f5149]">Each line below is tied to a guest on your household invitation.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center lg:hidden">
                    <div className="border border-[#ded2c4] px-4 py-3">
                      <p className="serif text-3xl font-semibold">{household.guests.length}</p>
                      <p className="fine-print">guests</p>
                    </div>
                    <div className="border border-[#ded2c4] px-4 py-3">
                      <p className="serif text-3xl font-semibold">{invitedEventCount}</p>
                      <p className="fine-print">events</p>
                    </div>
                  </div>
                </div>

                <form action={submitRsvpAction}>
                  <input type="hidden" name="householdId" value={household.id} />
                  <div className="grid gap-5">
                    {household.guests.map((guest, guestIndex) => {
                      const invitations = household.eventInvitations
                        .filter((invite) => invite.guestId === guest.id && invite.invited && invite.event.isActive)
                        .sort((a, b) => a.event.sortOrder - b.event.sortOrder);

                      return (
                        <section key={guest.id} className="overflow-hidden border border-[#d7c6b5] bg-[#fffdf9] shadow-[0_12px_38px_rgba(58,43,34,0.055)]">
                          <div className="grid gap-4 border-b border-[#ded2c4] bg-[#fffaf4] p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
                            <div className="min-w-0">
                              <p className="fine-print">
                                Invitee {guestIndex + 1} / {guest.isChild ? "Child" : "Adult"}{guest.plusOneAllowed ? " / plus-one eligible" : ""}
                              </p>
                              <h3 className="serif mt-1 text-3xl font-semibold leading-none sm:text-4xl">{guest.firstName} {guest.lastName}</h3>
                            </div>
                            <CheckCircle2 className="hidden text-[#9a6932] sm:block" aria-hidden="true" />
                          </div>

                          {guest.plusOneAllowed ? (
                            <div className="border-b border-[#ded2c4] bg-[#fbf2e7] p-4 sm:p-5">
                              <label htmlFor={`plusOneName:${guest.id}`}>Plus-one name</label>
                              <input id={`plusOneName:${guest.id}`} name={`plusOneName:${guest.id}`} defaultValue={guest.plusOneName || ""} placeholder="Guest name" />
                              <p className="mt-2 text-xs leading-5 text-[#6b5c51]">Only one plus-one is available because it is included on this invitation.</p>
                            </div>
                          ) : null}

                          <div className="grid gap-4 p-4 sm:p-5">
                            {invitations.length ? null : <p className="text-sm text-[#5f5149]">No RSVP-required events are assigned to this guest yet.</p>}
                            {invitations.map((invite) => {
                              const event = invite.event;
                              const existing = rsvpByGuestEvent.get(`${guest.id}:${event.id}`);
                              const mealOptions = (event.mealOptions || "").split("|").filter(Boolean);
                              const location = event.venueName.includes("TBD") || event.city === "TBD" ? "Location to be announced" : `${event.venueName}, ${event.city}, ${event.state}`;

                              return (
                                <article key={invite.id} className="border border-[#e2d5c5] bg-[#faf6ef] p-4 sm:p-5">
                                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,auto)] lg:items-start">
                                    <div className="min-w-0">
                                      <p className="eyebrow">{formatDate(event.date)} / {formatTimeForDisplay(event.startTime)}</p>
                                      <h4 className="serif mt-2 text-2xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-3xl">{event.title}</h4>
                                      <p className="mt-2 text-sm leading-6 text-[#5f5149]">{location}</p>
                                    </div>
                                    <fieldset aria-label={`${guest.firstName} ${event.title} attendance`}>
                                      <legend className="sr-only">Attendance</legend>
                                      <div className="grid grid-cols-2 gap-2">
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

                                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    {event.mealSelectionRequired ? (
                                      <div>
                                        <label htmlFor={`meal:${guest.id}:${event.id}`}>Meal choice</label>
                                        <select id={`meal:${guest.id}:${event.id}`} name={`meal:${guest.id}:${event.id}`} defaultValue={existing?.mealChoice || ""}>
                                          <option value="">Select a meal if attending</option>
                                          {mealOptions.map((meal) => <option key={meal}>{meal}</option>)}
                                        </select>
                                      </div>
                                    ) : null}
                                    <div>
                                      <label htmlFor={`dietary:${guest.id}:${event.id}`}>Dietary restrictions</label>
                                      <input id={`dietary:${guest.id}:${event.id}`} name={`dietary:${guest.id}:${event.id}`} defaultValue={existing?.dietaryRestrictions || ""} placeholder="None, vegetarian, allergies..." />
                                    </div>
                                  </div>

                                  <details className="celebration-detail mt-4 border-t border-[#e2d5c5] pt-4">
                                    <summary className="flex list-none items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.16em] text-[#7f542b]">
                                      Accessibility, song, and shuttle notes
                                      <span className="detail-icon text-lg leading-none" aria-hidden="true">+</span>
                                    </summary>
                                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                      <div>
                                        <label htmlFor={`accessibility:${guest.id}:${event.id}`}>Accessibility needs</label>
                                        <input id={`accessibility:${guest.id}:${event.id}`} name={`accessibility:${guest.id}:${event.id}`} defaultValue={existing?.accessibilityNeeds || ""} placeholder="Optional" />
                                      </div>
                                      <div>
                                        <label htmlFor={`song:${guest.id}:${event.id}`}>Song request</label>
                                        <input id={`song:${guest.id}:${event.id}`} name={`song:${guest.id}:${event.id}`} defaultValue={existing?.songRequest || ""} placeholder="Optional" />
                                      </div>
                                      <div>
                                        <label htmlFor={`travel:${guest.id}:${event.id}`}>Travel or shuttle notes</label>
                                        <input id={`travel:${guest.id}:${event.id}`} name={`travel:${guest.id}:${event.id}`} defaultValue={existing?.travelNotes || ""} placeholder="Optional" />
                                      </div>
                                    </div>
                                  </details>
                                </article>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>

                  <div className="sticky bottom-0 mt-6 grid gap-4 border border-[#211915] bg-[#211915] p-4 text-[#fffaf4] shadow-[0_-18px_48px_rgba(58,43,34,0.16)] lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <h3 className="serif text-3xl font-semibold">Review & submit</h3>
                      <p className="mt-1 text-sm leading-6 text-[#eadfd4]">Submitting updates this household&apos;s existing RSVP records.</p>
                    </div>
                    <button className="btn bg-[#fffaf4] text-[#211915] hover:bg-white">Submit RSVP</button>
                  </div>
                </form>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link className="btn btn-secondary" href={`/events?code=${encodeURIComponent(household.inviteCode)}`}>View invited events</Link>
                  <Link className="btn btn-secondary" href={`/invite/${household.inviteLinkToken}`}>Private invitation hub</Link>
                </div>
              </section>
            ) : (
              <section className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
                <div className="image-frame min-h-72">
                  <img src="/photos/andre-bebe-portrait.jpg" alt="Andre and Bebe engagement portrait" className="object-[58%_36%]" />
                </div>
                <div className="grid content-center gap-6">
                  <div>
                    <p className="eyebrow">Private RSVP</p>
                    <h2 className="serif mt-3 text-4xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-5xl">Your invitation opens here</h2>
                    <p className="mt-4 max-w-2xl text-[1rem] leading-8 text-[#5f5149]">
                      We will show exactly who is invited from your household, plus the events assigned to each guest. You can close this window anytime and return to the main wedding site.
                    </p>
                  </div>
                  <div className="grid gap-3 text-sm leading-6 text-[#5f5149] sm:grid-cols-3">
                    <p className="border border-[#ded2c4] bg-[#fffdf9] p-4"><UsersRound className="mb-2 text-[#9a6932]" size={18} aria-hidden="true" />Household based</p>
                    <p className="border border-[#ded2c4] bg-[#fffdf9] p-4"><CalendarDays className="mb-2 text-[#9a6932]" size={18} aria-hidden="true" />Event specific</p>
                    <p className="border border-[#ded2c4] bg-[#fffdf9] p-4"><LockKeyhole className="mb-2 text-[#9a6932]" size={18} aria-hidden="true" />Private details</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
