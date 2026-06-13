import Link from "next/link";
import { CalendarDays, LockKeyhole, Search, UsersRound, X } from "lucide-react";
import { submitRsvpAction } from "@/lib/actions";
import { formatTimeForDisplay } from "@/lib/event-time";
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
  const eventColumns = household
    ? [...new Map(household.eventInvitations.filter((invite) => invite.event.isActive).map((invite) => [invite.eventId, invite.event])).values()].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      )
    : [];
  const inviteByGuestEvent = new Map(
    household?.eventInvitations.filter((invite) => invite.guestId && invite.event.isActive).map((invite) => [`${invite.guestId}:${invite.eventId}`, invite]) || [],
  );
  const plusOneGuests = household?.guests.filter((guest) => guest.plusOneAllowed) || [];
  const matrixMinWidth = `${Math.max(42, 13 + eventColumns.length * 10)}rem`;

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#15110f] text-[#211915]">
      <img src="/photos/andre-bebe-close.jpg" alt="" fetchPriority="high" className="hero-photo fixed inset-0 h-full w-full object-cover opacity-25 sm:opacity-34" />
      <div className="fixed inset-0 bg-[#15110f]/76" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(214,174,118,0.22),transparent_25rem),radial-gradient(circle_at_82%_20%,rgba(157,95,88,0.16),transparent_24rem)]" />

      <Link
        href="/"
        aria-label="Close RSVP and return to the wedding site"
        className="fixed right-2 top-2 z-30 inline-flex h-11 w-11 items-center justify-center border border-white/18 bg-[#fffaf4] text-[#211915] shadow-2xl hover:bg-white sm:right-6 sm:top-6 sm:h-12 sm:w-12"
      >
        <X size={20} aria-hidden="true" />
      </Link>

      <section className="relative z-10 flex min-h-[100dvh] items-stretch justify-center px-0 py-0 sm:min-h-screen sm:items-center sm:px-4 sm:py-4" aria-labelledby="rsvp-title">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-title"
          className="animate-fade flex h-[100dvh] max-h-[100dvh] w-full max-w-[92rem] flex-col overflow-hidden border-0 bg-[#fffaf4] shadow-[0_30px_110px_rgba(0,0,0,0.42)] sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:border sm:border-[#d8c8b7]"
        >
          <header className="shrink-0 border-b border-[#ded2c4] bg-[#fffaf4]/96 backdrop-blur">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="p-3 pr-14 sm:p-5 sm:pr-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="mt-1 hidden h-11 w-11 shrink-0 items-center justify-center border border-[#d8c8b7] bg-[#fbf2e7] sm:flex">
                    <LockKeyhole size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="eyebrow">{household ? "Invitation found" : "RSVP"}</p>
                    <h1 id="rsvp-title" className="serif mt-1 text-2xl font-semibold uppercase leading-none tracking-[0.06em] text-[#211915] sm:mt-2 sm:text-4xl sm:tracking-[0.08em]">
                      {household ? household.name : "Find your invitation"}
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f5149] sm:mt-3 sm:text-[0.98rem] sm:leading-7">
                      {household
                        ? "Confirm each invitee below. Private events only appear when they are assigned to this household."
                        : "Enter your invitation code, household name, guest name, or email to open your private RSVP."}
                    </p>
                  </div>
                </div>

                <form className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-[minmax(0,1fr)_auto]" action="/rsvp#responses" method="get">
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
                  <button className="btn btn-primary w-full self-end sm:w-auto">
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

              <aside className="hidden border-l border-[#ded2c4] bg-[#fbf2e7] p-5 lg:block">
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
              <section id="responses" className="scroll-mt-4 p-3 sm:p-6">
                <div className="mb-4 grid gap-3 border-y border-[#ded2c4] bg-[#fffaf4]/70 py-3 sm:mb-5 sm:grid-cols-[1fr_auto] sm:items-center sm:py-4">
                  <div>
                    <p className="eyebrow">Your invitees</p>
                    <h2 className="serif mt-1 text-[1.65rem] font-semibold uppercase leading-none tracking-[0.06em] sm:text-3xl sm:tracking-[0.08em]">Group RSVP</h2>
                    <p className="mt-2 text-sm leading-6 text-[#5f5149]">Each available choice is controlled by your household invitation. Events not assigned to an invitee are marked unavailable.</p>
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
                  {plusOneGuests.length ? (
                    <div className="mb-4 border border-[#d7c6b5] bg-[#fffdf9] p-3 sm:mb-5 sm:p-4">
                      <p className="eyebrow">Approved plus-ones</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {plusOneGuests.map((guest) => (
                          <div key={guest.id}>
                            <label htmlFor={`plusOneName:${guest.id}`}>{guest.firstName}&apos;s plus-one name</label>
                            <input id={`plusOneName:${guest.id}`} name={`plusOneName:${guest.id}`} defaultValue={guest.plusOneName || ""} placeholder="Guest name" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="overflow-hidden border border-[#d7c6b5] bg-[#fffdf9] shadow-[0_12px_38px_rgba(58,43,34,0.045)]">
                    <div className="grid gap-3 border-b border-[#ded2c4] bg-[#fffaf4] px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center sm:px-4">
                      <div>
                        <p className="eyebrow">RSVP matrix</p>
                        <h3 className="serif mt-1 text-2xl font-semibold leading-none">Family responses</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#7b6d64]">
                        <span className="border border-[#cdbfad] bg-[#fffdf9] px-3 py-2">Yes / No</span>
                        <span className="border border-[#d8cfc3] bg-[#ece5dc] px-3 py-2">Unavailable</span>
                      </div>
                    </div>

                    {eventColumns.length ? (
                      <>
                      <div className="grid gap-3 p-3 md:hidden">
                        {household.guests.map((guest, guestIndex) => (
                          <section key={guest.id} className="border border-[#ded2c4] bg-[#fffaf4]">
                            <div className="border-b border-[#ded2c4] bg-[#fffdf9] px-3 py-3">
                              <p className="fine-print">
                                Invitee {guestIndex + 1} / {guest.isChild ? "Child" : "Adult"}
                              </p>
                              <h4 className="serif mt-1 text-2xl font-semibold leading-none">{guest.firstName} {guest.lastName}</h4>
                              {guest.plusOneAllowed ? <p className="mt-2 text-xs font-semibold text-[#6d625b]">Plus-one eligible</p> : null}
                            </div>
                            <div className="divide-y divide-[#ded2c4]">
                              {eventColumns.map((event) => {
                                const invite = inviteByGuestEvent.get(`${guest.id}:${event.id}`);
                                const existing = rsvpByGuestEvent.get(`${guest.id}:${event.id}`);
                                const eventLabel = `${event.date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })} / ${formatTimeForDisplay(event.startTime)}`;

                                if (!invite?.invited) {
                                  return (
                                    <div key={event.id} className="grid gap-3 bg-[#ece5dc] px-3 py-3">
                                      <div>
                                        <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#5e524b]">{event.title}</p>
                                        <p className="mt-1 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#87786e]">{eventLabel}</p>
                                      </div>
                                      <p className="border border-[#d8cfc3] bg-[#e4ddd4] px-3 py-2 text-center text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#87786e]">
                                        Not invited
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={event.id} className="grid gap-3 px-3 py-3">
                                    <div>
                                      <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#211915]">{event.title}</p>
                                      <p className="mt-1 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#9a6932]">{eventLabel}</p>
                                    </div>
                                    <fieldset aria-label={`${guest.firstName} ${event.title} attendance`}>
                                      <legend className="sr-only">Attendance</legend>
                                      <div className="grid grid-cols-2 border border-[#cdbfad] bg-[#fffaf4] p-1">
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
                                            <span className="flex min-h-11 items-center justify-center px-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#493c35] peer-checked:bg-[#211915] peer-checked:text-white">
                                              {choice === "YES" ? "Yes" : "No"}
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </fieldset>
                                  </div>
                                );
                              })}
                            </div>
                          </section>
                        ))}
                      </div>

                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full border-collapse text-left" style={{ minWidth: matrixMinWidth }}>
                          <caption className="sr-only">Household RSVP matrix by guest and event</caption>
                          <thead>
                            <tr className="border-b border-[#ded2c4] bg-[#faf6ef] align-top">
                              <th scope="col" className="sticky left-0 z-20 w-52 border-r border-[#ded2c4] bg-[#faf6ef] px-4 py-3">
                                <span className="fine-print">Guest</span>
                              </th>
                              {eventColumns.map((event) => (
                                <th key={event.id} scope="col" className="min-w-40 border-r border-[#eadfd2] px-3 py-3 last:border-r-0">
                                  <p className="line-clamp-2 text-sm font-bold uppercase tracking-[0.1em] text-[#211915]">{event.title}</p>
                                  <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#9a6932]">
                                    {event.date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })} / {formatTimeForDisplay(event.startTime)}
                                  </p>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {household.guests.map((guest, guestIndex) => (
                              <tr key={guest.id} className="border-b border-[#eadfd2] align-top last:border-b-0">
                                <th scope="row" className="sticky left-0 z-10 w-52 border-r border-[#ded2c4] bg-[#fffdf9] px-4 py-3">
                                  <p className="fine-print">
                                    Invitee {guestIndex + 1} / {guest.isChild ? "Child" : "Adult"}
                                  </p>
                                  <p className="serif mt-1 text-2xl font-semibold leading-none">{guest.firstName} {guest.lastName}</p>
                                  {guest.plusOneAllowed ? <p className="mt-2 text-xs font-semibold text-[#6d625b]">Plus-one eligible</p> : null}
                                </th>
                                {eventColumns.map((event) => {
                                  const invite = inviteByGuestEvent.get(`${guest.id}:${event.id}`);
                                  const existing = rsvpByGuestEvent.get(`${guest.id}:${event.id}`);

                                  if (!invite?.invited) {
                                    return (
                                      <td key={event.id} className="border-r border-[#ded2c4] bg-[#ece5dc] px-3 py-3 text-center last:border-r-0">
                                        <span className="inline-flex min-h-12 w-full items-center justify-center border border-[#d8cfc3] bg-[#e4ddd4] px-3 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#87786e]">
                                          Unavailable
                                        </span>
                                      </td>
                                    );
                                  }

                                  return (
                                    <td key={event.id} className="border-r border-[#eadfd2] bg-[#fffdf9] px-3 py-3 last:border-r-0">
                                      <fieldset aria-label={`${guest.firstName} ${event.title} attendance`}>
                                        <legend className="sr-only">Attendance</legend>
                                        <div className="grid grid-cols-2 border border-[#cdbfad] bg-[#fffaf4] p-1">
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
                                              <span className="flex min-h-10 items-center justify-center px-3 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[#493c35] peer-checked:bg-[#211915] peer-checked:text-white">
                                                {choice === "YES" ? "Yes" : "No"}
                                              </span>
                                            </label>
                                          ))}
                                        </div>
                                      </fieldset>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      </>
                    ) : (
                      <p className="px-4 py-5 text-sm leading-6 text-[#5f5149]">No RSVP-required events are assigned to this household yet.</p>
                    )}
                  </div>

                  <div className="sticky bottom-0 z-10 -mx-3 mt-5 grid gap-3 border-t border-[#d6c8b8] bg-[#fffaf4]/96 px-3 py-3 text-[#211915] shadow-[0_-18px_42px_rgba(58,43,34,0.12)] backdrop-blur sm:-mx-6 sm:mt-6 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <h3 className="serif text-2xl font-semibold">Ready to send?</h3>
                      <p className="mt-1 text-sm leading-6 text-[#5f5149]">You can come back and update these responses before the RSVP deadline.</p>
                    </div>
                    <button className="btn btn-primary w-full sm:w-auto">Submit RSVP</button>
                  </div>
                </form>

                <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
                  <Link className="btn btn-secondary" href={`/events?code=${encodeURIComponent(household.inviteCode)}`}>View invited events</Link>
                  <Link className="btn btn-secondary" href={`/invite/${household.inviteLinkToken}`}>Private invitation hub</Link>
                </div>
              </section>
            ) : (
              <section className="grid gap-5 p-3 sm:gap-6 sm:p-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
                <div className="image-frame min-h-56 sm:min-h-72">
                  <img src="/photos/andre-bebe-portrait.jpg" alt="Andre and Bebe engagement portrait" className="object-[58%_36%]" />
                </div>
                <div className="grid content-center gap-6">
                  <div>
                    <p className="eyebrow">Private RSVP</p>
                    <h2 className="serif mt-3 text-3xl font-semibold uppercase leading-none tracking-[0.06em] sm:text-5xl sm:tracking-[0.08em]">Your invitation opens here</h2>
                    <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-[#5f5149] sm:leading-8">
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
