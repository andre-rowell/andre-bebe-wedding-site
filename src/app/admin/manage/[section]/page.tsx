import { notFound } from "next/navigation";
import {
  assignHouseholdToEventAction,
  deleteEntityAction,
  moderateGuestbookAction,
  saveEventAction,
  saveFaqAction,
  saveGuestAction,
  saveHouseholdAction,
  saveRegistryAction,
  saveSettingAction,
  saveTravelAction,
  updateRsvpAction,
} from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const titles: Record<string, string> = {
  guests: "Guest List",
  households: "Households",
  rsvps: "RSVP Management",
  events: "Event Management",
  registry: "Registry Management",
  content: "Content Management",
  faqs: "FAQ Management",
  travel: "Travel & Hotels",
  guestbook: "Guestbook Moderation",
};

type HouseholdWithGuests = Awaited<ReturnType<typeof prisma.household.findMany>>[number] & {
  guests: Awaited<ReturnType<typeof prisma.guest.findMany>>;
};

type EventRecord = Awaited<ReturnType<typeof prisma.event.findMany>>[number];

function DeleteButton({ id, type }: { id: string; type: string }) {
  return (
    <form action={deleteEntityAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="type" value={type} />
      <button className="text-sm font-bold text-[#9d3f3b]">Delete</button>
    </form>
  );
}

export default async function ManagePage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams?: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { section } = await params;
  const query = (await searchParams)?.q?.trim() || "";
  if (!titles[section]) notFound();

  const households = await prisma.household.findMany({ orderBy: { name: "asc" }, include: { guests: true } });
  const events = await prisma.event.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b76768]">Manage</p>
          <h1 className="serif text-5xl font-bold">{titles[section]}</h1>
        </div>
        {["guests", "households", "rsvps"].includes(section) ? (
          <form className="flex gap-2">
            <input name="q" defaultValue={query} placeholder="Search" className="min-w-64" />
            <button className="btn btn-secondary">Search</button>
          </form>
        ) : null}
      </div>
      {section === "guests" ? <GuestsManager query={query} households={households} /> : null}
      {section === "households" ? <HouseholdsManager query={query} households={households} /> : null}
      {section === "rsvps" ? <RsvpsManager query={query} /> : null}
      {section === "events" ? <EventsManager events={events} households={households} /> : null}
      {section === "registry" ? <RegistryManager /> : null}
      {section === "content" ? <ContentManager /> : null}
  {section === "faqs" ? <FaqManager /> : null}
  {section === "travel" ? <TravelManager /> : null}
      {section === "guestbook" ? <GuestbookManager /> : null}
    </div>
  );
}

async function GuestsManager({ query, households }: { query: string; households: HouseholdWithGuests[] }) {
  const guests = await prisma.guest.findMany({
    where: query
      ? {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
            { tags: { contains: query } },
            { relationshipGroup: { contains: query } },
            { household: { name: { contains: query } } },
          ],
        }
      : undefined,
    include: { household: true, eventInvitations: { include: { event: true } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <form action={saveGuestAction} className="card space-y-4 p-5">
        <h2 className="serif text-3xl font-bold">Add guest</h2>
        <select name="householdId" required>
          <option value="">Select household</option>
          {households.map((household) => <option key={household.id} value={household.id}>{household.name}</option>)}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="firstName" placeholder="First name" required />
          <input name="lastName" placeholder="Last name" required />
        </div>
        <input name="email" placeholder="Email" />
        <input name="phone" placeholder="Phone" />
        <input name="relationshipGroup" placeholder="Relationship group" />
        <input name="tags" placeholder="Tags: family,friends,out-of-town" />
        <textarea name="notes" placeholder="Internal notes" rows={3} />
        <div className="grid gap-2 text-sm">
          <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="isAdult" type="checkbox" defaultChecked /> Adult</label>
          <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="isChild" type="checkbox" /> Child</label>
          <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="plusOneAllowed" type="checkbox" /> Plus-one allowed</label>
        </div>
        <button className="btn btn-primary w-full">Save guest</button>
      </form>
      <div className="card overflow-x-auto p-1">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Household</th><th>Contact</th><th>Tags</th><th>Invited Events</th><th></th></tr></thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td><strong>{guest.firstName} {guest.lastName}</strong><br />{guest.isChild ? "Child" : "Adult"}{guest.plusOneAllowed ? " · Plus-one" : ""}</td>
                <td>{guest.household.name}</td>
                <td>{guest.email}<br />{guest.phone}</td>
                <td>{guest.relationshipGroup}<br />{guest.tags}</td>
                <td>{guest.eventInvitations.map((invite) => invite.event.title).join(", ") || "None"}</td>
                <td><DeleteButton id={guest.id} type="guest" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HouseholdsManager({ query, households }: { query: string; households: HouseholdWithGuests[] }) {
  const filtered = query ? households.filter((household) => `${household.name} ${household.primaryEmail} ${household.inviteCode}`.toLowerCase().includes(query.toLowerCase())) : households;
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <form action={saveHouseholdAction} className="card space-y-4 p-5">
        <h2 className="serif text-3xl font-bold">Create household</h2>
        <input name="name" placeholder="Household name" required />
        <input name="primaryEmail" placeholder="Primary email" />
        <input name="primaryPhone" placeholder="Primary phone" />
        <input name="mailingAddressLine1" placeholder="Address line 1" />
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="city" placeholder="City" />
          <input name="state" placeholder="State" />
          <input name="postalCode" placeholder="Postal code" />
        </div>
        <input name="inviteCode" placeholder="Invite code" required />
        <input name="inviteLinkToken" placeholder="Secure invite token" required />
        <textarea name="notes" placeholder="Notes" rows={3} />
        <button className="btn btn-primary w-full">Save household</button>
      </form>
      <div className="card overflow-x-auto p-1">
        <table className="admin-table">
          <thead><tr><th>Household</th><th>Guests</th><th>Invite</th><th>Status</th><th>Address</th><th></th></tr></thead>
          <tbody>
            {filtered.map((household) => (
              <tr key={household.id}>
                <td><strong>{household.name}</strong><br />{household.primaryEmail}</td>
                <td>{household.guests.map((guest) => `${guest.firstName} ${guest.lastName}`).join(", ")}</td>
                <td><code>{household.inviteCode}</code><br /><span className="text-xs">/rsvp?code={household.inviteCode}</span></td>
                <td>{household.invitationStatus}</td>
                <td>{household.mailingAddressLine1}<br />{household.city}, {household.state} {household.postalCode}</td>
                <td><DeleteButton id={household.id} type="household" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function RsvpsManager({ query }: { query: string }) {
  const rsvps = await prisma.rSVP.findMany({
    where: query ? { OR: [{ guest: { firstName: { contains: query } } }, { guest: { lastName: { contains: query } } }, { household: { name: { contains: query } } }, { event: { title: { contains: query } } }] } : undefined,
    include: { guest: true, household: true, event: true },
    orderBy: { updatedAt: "desc" },
  });
  const missing = await prisma.eventInvitation.findMany({
    where: { invited: true, guest: { rsvps: { none: {} } } },
    include: { guest: true, household: true, event: true },
    take: 20,
  });
  return (
    <div className="grid gap-6">
      <div className="card overflow-x-auto p-1">
        <table className="admin-table">
          <thead><tr><th>Guest</th><th>Household</th><th>Event</th><th>Status</th><th>Meal</th><th>Needs</th><th>Update</th></tr></thead>
          <tbody>
            {rsvps.map((rsvp) => (
              <tr key={rsvp.id}>
                <td>{rsvp.guest.firstName} {rsvp.guest.lastName}</td>
                <td>{rsvp.household.name}</td>
                <td>{rsvp.event.title}</td>
                <td>{rsvp.attending}</td>
                <td>{rsvp.mealChoice}</td>
                <td>{rsvp.dietaryRestrictions}<br />{rsvp.accessibilityNeeds}</td>
                <td>
                  <form action={updateRsvpAction} className="grid min-w-52 gap-2">
                    <input type="hidden" name="id" value={rsvp.id} />
                    <select name="attending" defaultValue={rsvp.attending}>
                      <option>YES</option><option>NO</option><option>UNANSWERED</option>
                    </select>
                    <input name="mealChoice" defaultValue={rsvp.mealChoice || ""} placeholder="Meal" />
                    <input name="dietaryRestrictions" defaultValue={rsvp.dietaryRestrictions || ""} placeholder="Dietary notes" />
                    <button className="btn btn-secondary">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="card p-5">
        <h2 className="serif text-3xl font-bold">Not responded sample</h2>
        <p className="mt-1 text-sm text-[#6a5c55]">Use export reports for the full reminder list.</p>
        <div className="mt-4 grid gap-2">
          {missing.map((invite) => <p key={invite.id} className="text-sm"><strong>{invite.guest?.firstName} {invite.guest?.lastName}</strong> · {invite.household.name} · {invite.event.title}</p>)}
        </div>
      </section>
    </div>
  );
}

function eventDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function EventFields({ event }: { event?: EventRecord }) {
  return (
    <>
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <input name="title" placeholder="Event title" defaultValue={event?.title || ""} required />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="slug" placeholder="slug" defaultValue={event?.slug || ""} required />
        <input name="type" placeholder="Type" defaultValue={event?.type || ""} required />
      </div>
      <textarea name="description" placeholder="Description" rows={3} defaultValue={event?.description || ""} required />
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="date" type="date" defaultValue={event ? eventDateInput(event.date) : ""} required />
        <input name="startTime" placeholder="Start" defaultValue={event?.startTime || ""} required />
        <input name="endTime" placeholder="End" defaultValue={event?.endTime || ""} />
      </div>
      <input name="venueName" placeholder="Venue" defaultValue={event?.venueName || ""} required />
      <input name="addressLine1" placeholder="Address" defaultValue={event?.addressLine1 || ""} required />
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="city" placeholder="City" defaultValue={event?.city || ""} required />
        <input name="state" placeholder="State" defaultValue={event?.state || ""} required />
        <input name="postalCode" placeholder="Postal" defaultValue={event?.postalCode || ""} />
      </div>
      <select name="visibility" defaultValue={event?.visibility || "PUBLIC"}>
        <option>PUBLIC</option>
        <option>PRIVATE</option>
        <option>INVITE_ONLY</option>
      </select>
      <input name="mealOptions" placeholder="Meal options separated with |" defaultValue={event?.mealOptions || ""} />
      <textarea name="parkingInfo" placeholder="Parking info" rows={2} defaultValue={event?.parkingInfo || ""} />
      <textarea name="transportationInfo" placeholder="Transportation info" rows={2} defaultValue={event?.transportationInfo || ""} />
      <input name="dressCode" placeholder="Dress code" defaultValue={event?.dressCode || ""} />
      <input name="mapUrl" placeholder="Map URL" defaultValue={event?.mapUrl || ""} />
      <input name="sortOrder" type="number" defaultValue={event?.sortOrder ?? 0} />
      <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="rsvpRequired" type="checkbox" defaultChecked={event?.rsvpRequired ?? true} /> RSVP required</label>
      <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="mealSelectionRequired" type="checkbox" defaultChecked={event?.mealSelectionRequired ?? false} /> Meal required</label>
      <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="isActive" type="checkbox" defaultChecked={event?.isActive ?? true} /> Active</label>
    </>
  );
}

function EventsManager({ events, households }: { events: EventRecord[]; households: HouseholdWithGuests[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <div className="space-y-6">
        <form action={saveEventAction} className="card space-y-4 p-5">
          <h2 className="serif text-3xl font-bold">Add event</h2>
          <EventFields />
          <button className="btn btn-primary w-full">Save event</button>
        </form>
        <form action={assignHouseholdToEventAction} className="card space-y-4 p-5">
          <h2 className="serif text-3xl font-bold">Assign household</h2>
          <select name="eventId" required><option value="">Select event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select>
          <select name="householdId" required><option value="">Select household</option>{households.map((household) => <option key={household.id} value={household.id}>{household.name}</option>)}</select>
          <button className="btn btn-secondary w-full">Invite household to event</button>
        </form>
      </div>
      <div className="grid gap-4">
        {events.map((event) => (
          <details key={event.id} className="card p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b76768]">Edit event</p>
                  <h2 className="serif text-3xl font-bold">{event.title}</h2>
                  <p className="mt-1 text-sm text-[#6a5c55]">
                    {event.date.toLocaleDateString()} · {event.startTime}
                    {event.endTime ? ` - ${event.endTime}` : ""} · {event.venueName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#eaded7] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">{event.visibility}</span>
                  <span className="rounded-full border border-[#eaded7] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">{event.isActive ? "Active" : "Hidden"}</span>
                </div>
              </div>
            </summary>
            <form action={saveEventAction} className="mt-5 space-y-4 border-t border-[#eaded7] pt-5">
              <EventFields event={event} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <button className="btn btn-primary flex-1">Update event</button>
              </div>
            </form>
            <div className="mt-3 flex justify-end">
              <DeleteButton id={event.id} type="event" />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

async function RegistryManager() {
  const links = await prisma.registryLink.findMany({ orderBy: { sortOrder: "asc" } });
  return <SimpleManager type="registry" rows={links} action={saveRegistryAction} fields={["title", "description", "url", "buttonText", "sortOrder"]} />;
}

async function FaqManager() {
  const rows = await prisma.fAQItem.findMany({ orderBy: { sortOrder: "asc" } });
  return <SimpleManager type="faq" rows={rows} action={saveFaqAction} fields={["question", "answer", "category", "sortOrder"]} />;
}

async function TravelManager() {
  const rows = await prisma.travelSection.findMany({ orderBy: { sortOrder: "asc" } });
  return <SimpleManager type="travel" rows={rows} action={saveTravelAction} fields={["title", "content", "category", "url", "sortOrder"]} />;
}

async function GuestbookManager() {
  const rows = await prisma.guestbookEntry.findMany({ orderBy: { createdAt: "desc" }, include: { household: true } });
  return (
    <div className="card overflow-x-auto p-1">
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Message</th><th>Household</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.name}</td>
              <td className="max-w-xl">{entry.message}</td>
              <td>{entry.household?.name || "Public"}</td>
              <td>{entry.isApproved ? "Visible" : "Hidden"}</td>
              <td>{entry.createdAt.toLocaleDateString()}</td>
              <td>
                <form action={moderateGuestbookAction} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={entry.id} />
                  <button name="guestbookAction" value={entry.isApproved ? "hide" : "approve"} className="btn btn-secondary">{entry.isApproved ? "Hide" : "Approve"}</button>
                  <button name="guestbookAction" value="delete" className="btn border border-[#9d3f3b] text-[#9d3f3b]">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimpleManager({ type, rows, action, fields }: { type: string; rows: Array<Record<string, unknown> & { id: string; isActive?: boolean }>; action: (formData: FormData) => Promise<void>; fields: string[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <form action={action} className="card space-y-4 p-5">
        <h2 className="serif text-3xl font-bold">Add {type}</h2>
        {fields.map((field) => field === "sortOrder" ? <input key={field} name={field} type="number" defaultValue={0} placeholder={field} /> : field === "answer" || field === "description" || field === "content" ? <textarea key={field} name={field} placeholder={field} rows={4} /> : <input key={field} name={field} placeholder={field} />)}
        <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="isActive" type="checkbox" defaultChecked /> Active</label>
        <button className="btn btn-primary w-full">Save</button>
      </form>
      <div className="card overflow-x-auto p-1">
        <table className="admin-table">
          <thead><tr>{fields.slice(0, 4).map((field) => <th key={field}>{field}</th>)}<th>Active</th><th></th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {fields.slice(0, 4).map((field) => <td key={field}>{String(row[field] || "")}</td>)}
                <td>{row.isActive ? "Yes" : "No"}</td>
                <td><DeleteButton id={row.id} type={type} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function ContentManager() {
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {settings.map((setting) => (
        <form key={setting.id} action={saveSettingAction} className="card space-y-3 p-5">
          <input type="hidden" name="key" value={setting.key} />
          <label htmlFor={setting.key}>{setting.key}</label>
          <textarea id={setting.key} name="value" defaultValue={setting.value} rows={setting.value.length > 80 ? 5 : 2} />
          <button className="btn btn-secondary">Save setting</button>
        </form>
      ))}
    </div>
  );
}
