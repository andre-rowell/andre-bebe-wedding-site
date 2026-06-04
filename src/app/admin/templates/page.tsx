import { dayOfMessageTemplate, reminderTemplate, rsvpConfirmationTemplate } from "@/lib/email-templates";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminTemplatesPage() {
  await requireAdmin();
  const households = await prisma.household.findMany({
    include: {
      guests: { include: { rsvps: { include: { event: true } } } },
      eventInvitations: { include: { event: true } },
    },
    orderBy: { name: "asc" },
  });

  const dayOf = dayOfMessageTemplate();
  const householdSummaries = households.map((household) => {
    const answered = new Set(household.guests.flatMap((guest) => guest.rsvps.filter((rsvp) => rsvp.attending !== "UNANSWERED").map((rsvp) => `${rsvp.eventId}:${guest.id}`)));
    const missingEvents = household.eventInvitations.filter((invite) => invite.invited && invite.guestId && !answered.has(`${invite.eventId}:${invite.guestId}`)).map((invite) => invite.event);
    return { household, missingEvents };
  });

  const sampleConfirmationHousehold = households.find((household) => household.guests.some((guest) => guest.rsvps.length)) || households[0];
  const confirmation = sampleConfirmationHousehold ? rsvpConfirmationTemplate(sampleConfirmationHousehold) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b76768]">Email-ready logic</p>
        <h1 className="serif text-5xl font-bold">Message templates</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6a5c55]">These templates are generated server-side from household tokens and RSVP state. They are ready for copy/paste or future email provider integration.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {confirmation ? (
          <section className="card p-5">
            <h2 className="serif text-3xl font-bold">RSVP confirmation</h2>
            <p className="mt-1 text-sm font-bold">{confirmation.subject}</p>
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-sm bg-[#241b18] p-4 text-sm leading-7 text-[#fffaf7]">{confirmation.body}</pre>
          </section>
        ) : null}
        <section className="card p-5">
          <h2 className="serif text-3xl font-bold">Day-of message</h2>
          <p className="mt-1 text-sm font-bold">{dayOf.subject}</p>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-sm bg-[#241b18] p-4 text-sm leading-7 text-[#fffaf7]">{dayOf.body}</pre>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="serif text-3xl font-bold">RSVP reminders by household</h2>
        <div className="mt-4 grid gap-4">
          {householdSummaries.map(({ household, missingEvents }) => {
            const reminder = reminderTemplate(household, missingEvents);
            return (
              <details key={household.id} className="border border-[#eaded7] bg-white/70 p-4">
                <summary className="cursor-pointer font-bold">
                  {household.name} · {missingEvents.length ? `${missingEvents.length} missing response${missingEvents.length === 1 ? "" : "s"}` : "complete"}
                </summary>
                <p className="mt-3 text-sm font-bold">{reminder.subject}</p>
                <pre className="mt-3 whitespace-pre-wrap bg-[#fbf7f0] p-4 text-sm leading-7">{reminder.body}</pre>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
