import { GuestPage, PageHero } from "@/components/site-shell";
import { submitRsvpAction } from "@/lib/actions";
import { formatTimeForDisplay } from "@/lib/event-time";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function RsvpPage({ searchParams }: { searchParams?: Promise<{ code?: string; q?: string; submitted?: string; error?: string }> }) {
  const params = await searchParams;
  const query = (params?.code || params?.q || "").trim();
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

  return (
    <GuestPage>
      <PageHero eyebrow="RSVP" title="RSVP" copy="RSVPs are handled by household, with a separate response for each invited guest and each event." />
      <section className="py-10">
        <div className="container max-w-6xl">
          <div className="section-frame mb-6 p-5">
            <div className="grid grid-cols-5 gap-2 text-center">
              {["Find you", "Your party", "RSVP", "Details", "Review"].map((step, index) => (
                <div key={step} className="relative">
                  <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${index === 0 ? "border-[#211915] bg-[#211915] text-[#fffaf7]" : "border-[#d9cbbb] bg-[#fffdf9]"}`}>{index + 1}</div>
                  <p className="mt-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#6d625b]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="section-frame overflow-hidden">
            <img src="/photos/andre-bebe-portrait.jpg" alt="Andre and Bebe engagement portrait" loading="lazy" decoding="async" className="h-72 w-full object-cover object-[58%_38%] lg:h-96" />
            <div className="p-6">
            <form className="space-y-4" action="/rsvp">
              <div>
                <h2 className="serif text-4xl font-semibold">Let&apos;s find your invitation</h2>
                <p className="mt-2 text-sm leading-7 text-[#6d625b]">Enter your name or invitation code to get started.</p>
                <label className="mt-5" htmlFor="q">Name or invitation code</label>
                <input id="q" name="q" defaultValue={query} placeholder="Example: ROWELL2026" />
              </div>
              <button className="btn btn-primary w-full">Search invitation</button>
            </form>
            {query && !household ? <p className="mt-4 bg-[#fff1ec] p-3 text-sm font-semibold text-[#8f403d]">We could not find that invitation. Check the spelling or use your invite code.</p> : null}
            {params?.submitted ? <p className="mt-4 bg-[#edf6ec] p-3 text-sm font-semibold text-[#3f7040]">Thank you. Your RSVP has been saved and can be updated before the RSVP deadline.</p> : null}
            </div>
          </div>

          {household ? (
            <form action={submitRsvpAction} className="section-frame p-6">
              <input type="hidden" name="householdId" value={household.id} />
              <div className="flex flex-col gap-2 border-b border-[#eaded7] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9b7039]">{household.inviteCode}</p>
                  <h2 className="serif text-4xl font-semibold">{household.name}</h2>
                </div>
                <a className="text-sm font-bold text-[#b76768]" href={`/events?code=${encodeURIComponent(household.inviteCode)}`}>View invited events</a>
              </div>
              <div className="mt-6 grid gap-6">
                {household.guests.map((guest) => {
                  const invitations = household.eventInvitations.filter((invite) => invite.guestId === guest.id && invite.invited && invite.event.isActive);
                  return (
                    <section key={guest.id} className="border border-[#e7dbce] bg-[#fffdf9] p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="serif text-3xl font-semibold">{guest.firstName} {guest.lastName}</h3>
                        <span className="bg-[#f2e8e1] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">{guest.isChild ? "Child" : "Adult"}</span>
                      </div>
                      {guest.plusOneAllowed ? (
                        <div className="mt-4">
                          <label htmlFor={`plusOneName:${guest.id}`}>Plus-one name</label>
                          <input id={`plusOneName:${guest.id}`} name={`plusOneName:${guest.id}`} defaultValue={guest.plusOneName || ""} placeholder="Guest name" />
                        </div>
                      ) : null}
                      <div className="mt-5 grid gap-4">
                        {invitations.map((invite) => {
                          const event = invite.event;
                          const existing = rsvpByGuestEvent.get(`${guest.id}:${event.id}`);
                          const mealOptions = (event.mealOptions || "").split("|").filter(Boolean);
                          return (
                            <div key={invite.id} className="border border-[#eaded7] bg-[#fbf7f0] p-4">
                              <p className="font-bold">{event.title}</p>
                              <p className="text-sm text-[#6a5c55]">{formatDate(event.date)} · {formatTimeForDisplay(event.startTime)}</p>
                              <fieldset className="mt-3 flex gap-3" aria-label={`${guest.firstName} ${event.title} attendance`}>
                                {["YES", "NO"].map((choice) => (
                                  <label key={choice} className="mb-0 flex flex-1 cursor-pointer items-center justify-center gap-2 border border-[#d9c8bf] bg-white px-4 py-2 text-sm">
                                    <input className="h-4 w-4" type="radio" name={`attending:${guest.id}:${event.id}`} value={choice} defaultChecked={(existing?.attending || "UNANSWERED") === choice} required />
                                    {choice === "YES" ? "Attending" : "Declines"}
                                  </label>
                                ))}
                              </fieldset>
                              {event.mealSelectionRequired ? (
                                <div className="mt-3">
                                  <label htmlFor={`meal:${guest.id}:${event.id}`}>Meal choice</label>
                                  <select id={`meal:${guest.id}:${event.id}`} name={`meal:${guest.id}:${event.id}`} defaultValue={existing?.mealChoice || ""}>
                                    <option value="">Select a meal</option>
                                    {mealOptions.map((meal) => <option key={meal}>{meal}</option>)}
                                  </select>
                                </div>
                              ) : null}
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div>
                                  <label htmlFor={`dietary:${guest.id}:${event.id}`}>Dietary restrictions</label>
                                  <input id={`dietary:${guest.id}:${event.id}`} name={`dietary:${guest.id}:${event.id}`} defaultValue={existing?.dietaryRestrictions || ""} placeholder="None, vegetarian, allergies..." />
                                </div>
                                <div>
                                  <label htmlFor={`accessibility:${guest.id}:${event.id}`}>Accessibility needs</label>
                                  <input id={`accessibility:${guest.id}:${event.id}`} name={`accessibility:${guest.id}:${event.id}`} defaultValue={existing?.accessibilityNeeds || ""} placeholder="Optional" />
                                </div>
                              </div>
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div>
                                  <label htmlFor={`song:${guest.id}:${event.id}`}>Song request</label>
                                  <input id={`song:${guest.id}:${event.id}`} name={`song:${guest.id}:${event.id}`} defaultValue={existing?.songRequest || ""} placeholder="Optional" />
                                </div>
                                <div>
                                  <label htmlFor={`travel:${guest.id}:${event.id}`}>Travel or shuttle notes</label>
                                  <input id={`travel:${guest.id}:${event.id}`} name={`travel:${guest.id}:${event.id}`} defaultValue={existing?.travelNotes || ""} placeholder="Optional" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
              <div className="dark-panel mt-6 p-5">
                <h3 className="serif text-3xl font-semibold">Review & submit</h3>
                <p className="mt-2 text-[#f4e4dc]">Please review each guest and event above. Submitting updates any previous RSVP for this household without creating duplicates.</p>
                <button className="btn mt-5 bg-white text-[#241b18] hover:bg-[#fff4ef]">Submit RSVP</button>
              </div>
            </form>
          ) : null}
        </div>
        </div>
      </section>
    </GuestPage>
  );
}
