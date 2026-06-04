import Link from "next/link";
import { saveSiteModeAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [guestCount, householdCount, rsvps, events, recent, invitations, settings, households] = await Promise.all([
    prisma.guest.count(),
    prisma.household.count(),
    prisma.rSVP.findMany({ include: { event: true, guest: true, household: true } }),
    prisma.event.findMany({ where: { isActive: true }, include: { rsvps: true, eventInvitations: true }, orderBy: { sortOrder: "asc" } }),
    prisma.rSVP.findMany({ take: 6, orderBy: { updatedAt: "desc" }, include: { guest: true, event: true, household: true } }),
    prisma.eventInvitation.findMany({ where: { invited: true }, include: { event: true, guest: true, household: true } }),
    prisma.siteSetting.findMany(),
    prisma.household.findMany({ include: { guests: { include: { rsvps: true } }, eventInvitations: true } }),
  ]);
  const attending = rsvps.filter((rsvp) => rsvp.attending === "YES").length;
  const declined = rsvps.filter((rsvp) => rsvp.attending === "NO").length;
  const invitedResponses = invitations.length;
  const notResponded = Math.max(0, invitedResponses - rsvps.filter((rsvp) => rsvp.attending !== "UNANSWERED").length);
  const completion = invitedResponses ? Math.round(((invitedResponses - notResponded) / invitedResponses) * 100) : 0;
  const mealCounts = rsvps.reduce<Record<string, number>>((acc, rsvp) => {
    if (rsvp.attending === "YES" && rsvp.mealChoice) acc[rsvp.mealChoice] = (acc[rsvp.mealChoice] || 0) + 1;
    return acc;
  }, {});
  const dietary = rsvps.filter((rsvp) => rsvp.dietaryRestrictions);
  const setting = Object.fromEntries(settings.map((item) => [item.key, item.value]));
  const fullHouseholds = households.filter((household) => {
    const invitedPairs = household.eventInvitations.filter((invite) => invite.invited && invite.guestId).map((invite) => `${invite.eventId}:${invite.guestId}`);
    const answeredPairs = new Set(household.guests.flatMap((guest) => guest.rsvps.filter((rsvp) => rsvp.attending !== "UNANSWERED").map((rsvp) => `${rsvp.eventId}:${guest.id}`)));
    return invitedPairs.length > 0 && invitedPairs.every((pair) => answeredPairs.has(pair));
  }).length;
  const dietaryBySeverity = dietary.reduce<Record<string, number>>((acc, rsvp) => {
    const key = /allerg|gluten|nut|dairy|vegan|vegetarian/i.test(rsvp.dietaryRestrictions || "") ? "Needs review" : "General note";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b76768]">Andre & Bebe</p>
        <h1 className="serif text-5xl font-bold">Admin dashboard</h1>
      </div>
      <form action={saveSiteModeAction} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="serif text-3xl font-bold">Site mode</h2>
          <p className="text-sm text-[#6a5c55]">Use this for launch day and after-wedding content planning.</p>
        </div>
        <div className="flex gap-2">
          <select name="siteMode" defaultValue={setting.siteMode || "wedding"} className="min-w-40">
            <option value="wedding">Wedding</option>
            <option value="day-of">Day-of</option>
            <option value="after">After</option>
          </select>
          <button className="btn btn-primary">Save mode</button>
        </div>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Invited guests", guestCount],
          ["Households", householdCount],
          ["Attending", attending],
          ["Declined", declined],
          ["Not responded", notResponded],
          ["Complete households", fullHouseholds],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm font-bold text-[#6a5c55]">{label}</p>
            <p className="serif mt-2 text-5xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="serif text-3xl font-bold">RSVP completion</h2>
            <p className="text-sm text-[#6a5c55]">{completion}% complete across invited guest-event responses.</p>
          </div>
          <p className="serif text-5xl font-bold text-[#b76768]">{completion}%</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#eaded7]">
          <div className="h-full bg-[#64745f]" style={{ width: `${completion}%` }} />
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <section className="card p-5">
          <h2 className="serif text-3xl font-bold">Attendance by event</h2>
          <div className="mt-4 space-y-3">
            {events.map((event) => (
              <div key={event.id} className="border-b border-[#eaded7] pb-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">{event.title}</span>
                  <span>{event.rsvps.filter((rsvp) => rsvp.attending === "YES").length}/{event.eventInvitations.length}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eaded7]">
                  <div className="h-full bg-[#b88948]" style={{ width: `${event.eventInvitations.length ? (event.rsvps.filter((rsvp) => rsvp.attending === "YES").length / event.eventInvitations.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-5">
          <h2 className="serif text-3xl font-bold">Meal counts</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(mealCounts).length ? Object.entries(mealCounts).map(([meal, count]) => (
              <div key={meal} className="flex justify-between gap-4 border-b border-[#eaded7] pb-2 text-sm">
                <span className="font-semibold">{meal}</span>
                <span>{count}</span>
              </div>
            )) : <p className="text-sm text-[#6a5c55]">No meal selections yet.</p>}
          </div>
        </section>
        <section className="card p-5">
          <h2 className="serif text-3xl font-bold">Dietary notes</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(dietaryBySeverity).map(([label, count]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-[#eaded7] pb-2 text-sm">
                <span className="font-semibold">{label}</span>
                <span>{count}</span>
              </div>
            ))}
            {dietary.length ? dietary.map((rsvp) => (
              <p key={rsvp.id} className="border-b border-[#eaded7] pb-2 text-sm"><strong>{rsvp.guest.firstName}:</strong> {rsvp.dietaryRestrictions}</p>
            )) : <p className="text-sm text-[#6a5c55]">No dietary restrictions yet.</p>}
          </div>
        </section>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-5">
          <h2 className="serif text-3xl font-bold">Recent RSVP activity</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="admin-table">
              <tbody>
                {recent.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td>{rsvp.guest.firstName} {rsvp.guest.lastName}</td>
                    <td>{rsvp.event.title}</td>
                    <td>{rsvp.attending}</td>
                    <td>{rsvp.updatedAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card p-5">
          <h2 className="serif text-3xl font-bold">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            {[
              ["Add guest", "/admin/manage/guests"],
              ["Manage events", "/admin/manage/events"],
              ["View RSVPs", "/admin/manage/rsvps"],
              ["Reminder templates", "/admin/templates"],
              ["Guestbook", "/admin/manage/guestbook"],
              ["Export reports", "/admin/reports"],
            ].map(([label, href]) => <Link key={href} href={href} className="btn btn-secondary justify-start">{label}</Link>)}
          </div>
        </section>
      </div>
    </div>
  );
}
