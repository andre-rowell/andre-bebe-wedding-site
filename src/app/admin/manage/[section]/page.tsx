import { notFound } from "next/navigation";
import { AdminActionForm } from "@/components/admin-action-form";
import { GuestInlineTable } from "@/components/guest-inline-table";
import {
  assignHouseholdToEventAction,
  deleteEntityAction,
  importGuestsCsvAction,
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
import { chicagoDateInputValue, formatTimeForDisplay, timeInputValue } from "@/lib/event-time";
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
      <div className="space-y-6">
        <AdminActionForm action={saveGuestAction} resetOnSuccess className="card space-y-4 p-5" successMessage="Guest saved.">
          <h2 className="serif text-3xl font-bold">Add guest</h2>
          <GuestFields households={households} />
          <button className="btn btn-primary w-full">Save guest</button>
        </AdminActionForm>
        <GuestImportPanel />
      </div>
      <div className="grid gap-4">
        <GuestInlineTable
          action={saveGuestAction}
          guests={guests.map((guest) => ({
            id: guest.id,
            householdId: guest.householdId,
            householdName: guest.household.name,
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            phone: guest.phone,
            guestSide: guest.guestSide,
            relationshipGroup: guest.relationshipGroup,
            tags: guest.tags,
            isAdult: guest.isAdult,
            isChild: guest.isChild,
            plusOneAllowed: guest.plusOneAllowed,
            plusOneName: guest.plusOneName,
            notes: guest.notes,
          }))}
          households={households.map((household) => ({ id: household.id, name: household.name }))}
        />
        {guests.map((guest) => (
          <details key={guest.id} className="card p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b76768]">Edit guest</p>
                  <h2 className="serif text-3xl font-bold">{guest.firstName} {guest.lastName}</h2>
                  <p className="mt-1 text-sm text-[#6a5c55]">{guest.household.name} · {guest.email || "No email"} · {guest.isChild ? "Child" : "Adult"} · {guest.guestSide}</p>
                </div>
                <span className="rounded-full border border-[#eaded7] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">{guest.plusOneAllowed ? "Plus-one" : "No plus-one"}</span>
              </div>
            </summary>
            <AdminActionForm action={saveGuestAction} className="mt-5 space-y-4 border-t border-[#eaded7] pt-5" successMessage="Guest updated.">
              <GuestFields guest={guest} households={households} />
              <button className="btn btn-primary w-full">Update guest</button>
            </AdminActionForm>
            <div className="mt-3 flex justify-between text-sm text-[#6a5c55]">
              <span>Invited events: {guest.eventInvitations.map((invite) => invite.event.title).join(", ") || "None"}</span>
              <DeleteButton id={guest.id} type="guest" />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function GuestImportPanel() {
  return (
    <AdminActionForm action={importGuestsCsvAction} resetOnSuccess className="card space-y-4 p-5" successMessage="Guest import complete.">
      <div>
        <h2 className="serif text-3xl font-bold">Import guests</h2>
        <p className="mt-1 text-sm leading-6 text-[#6a5c55]">
          Upload a CSV or paste rows. Supported headers include householdName, firstName, lastName, email, phone, side, relationshipGroup, tags, plusOneAllowed, isChild, inviteCode, inviteToken, address, city, state, zip.
        </p>
        <a className="mt-3 inline-flex text-sm font-bold text-[#9b7039] underline" href="/api/templates/guests-csv">Download sample CSV template</a>
      </div>
      <input name="csvFile" type="file" accept=".csv,text/csv" />
      <label htmlFor="csvText">Or paste CSV</label>
      <textarea id="csvText" name="csvText" rows={6} placeholder={"householdName,firstName,lastName,email,side,relationshipGroup,tags\nThe Smith Household,Jordan,Smith,jordan@example.com,Andre,Friends,out-of-town"} />
      <button className="btn btn-secondary w-full">Import CSV</button>
    </AdminActionForm>
  );
}

function GuestFields({ guest, households }: { guest?: Awaited<ReturnType<typeof prisma.guest.findMany>>[number]; households: HouseholdWithGuests[] }) {
  const id = guest?.id || "new";
  return (
    <>
      {guest ? <input type="hidden" name="id" value={guest.id} /> : null}
      <label htmlFor={`guest-household-${id}`}>Household</label>
      <select id={`guest-household-${id}`} name="householdId" defaultValue={guest?.householdId || ""} required>
        <option value="">Select household</option>
        {households.map((household) => <option key={household.id} value={household.id}>{household.name}</option>)}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`firstName-${id}`}>First name</label>
          <input id={`firstName-${id}`} name="firstName" placeholder="First name" defaultValue={guest?.firstName || ""} required />
        </div>
        <div>
          <label htmlFor={`lastName-${id}`}>Last name</label>
          <input id={`lastName-${id}`} name="lastName" placeholder="Last name" defaultValue={guest?.lastName || ""} required />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`guest-email-${id}`}>Email</label>
          <input id={`guest-email-${id}`} name="email" type="email" placeholder="name@example.com" defaultValue={guest?.email || ""} />
        </div>
        <div>
          <label htmlFor={`guest-phone-${id}`}>Phone</label>
          <input id={`guest-phone-${id}`} name="phone" type="tel" placeholder="612-555-0101" defaultValue={guest?.phone || ""} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`relationshipGroup-${id}`}>Relationship group</label>
          <select id={`relationshipGroup-${id}`} name="relationshipGroup" defaultValue={guest?.relationshipGroup || ""}>
            <option value="">Select group</option>
            {["Family", "Friends", "Wedding Party", "Work", "Out-of-town"].map((group) => <option key={group}>{group}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`tags-${id}`}>Tags</label>
          <input id={`tags-${id}`} name="tags" placeholder="family,friends,out-of-town" defaultValue={guest?.tags || ""} />
        </div>
      </div>
      <label htmlFor={`guestSide-${id}`}>Side</label>
      <select id={`guestSide-${id}`} name="guestSide" defaultValue={guest?.guestSide || "BOTH"}>
        <option value="ANDRE">Andre</option>
        <option value="BEBE">Bebe</option>
        <option value="BOTH">Both</option>
      </select>
      <label htmlFor={`plusOneName-${id}`}>Plus-one name</label>
      <input id={`plusOneName-${id}`} name="plusOneName" placeholder="Optional guest name" defaultValue={guest?.plusOneName || ""} />
      <label htmlFor={`guest-notes-${id}`}>Internal notes</label>
      <textarea id={`guest-notes-${id}`} name="notes" placeholder="Internal notes" rows={3} defaultValue={guest?.notes || ""} />
      <div className="grid gap-2 text-sm">
        <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="isAdult" type="checkbox" defaultChecked={guest?.isAdult ?? true} /> Adult</label>
        <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="isChild" type="checkbox" defaultChecked={guest?.isChild ?? false} /> Child</label>
        <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="plusOneAllowed" type="checkbox" defaultChecked={guest?.plusOneAllowed ?? false} /> Plus-one allowed</label>
      </div>
    </>
  );
}

function HouseholdsManager({ query, households }: { query: string; households: HouseholdWithGuests[] }) {
  const filtered = query ? households.filter((household) => `${household.name} ${household.primaryEmail} ${household.inviteCode}`.toLowerCase().includes(query.toLowerCase())) : households;
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <AdminActionForm action={saveHouseholdAction} resetOnSuccess className="card space-y-4 p-5" successMessage="Household saved.">
        <h2 className="serif text-3xl font-bold">Create household</h2>
        <HouseholdFields />
        <button className="btn btn-primary w-full">Save household</button>
      </AdminActionForm>
      <div className="grid gap-4">
        {filtered.map((household) => (
          <details key={household.id} className="card p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b76768]">Edit household</p>
                  <h2 className="serif text-3xl font-bold">{household.name}</h2>
                  <p className="mt-1 text-sm text-[#6a5c55]">{household.primaryEmail || "No email"} · {household.guests.length} guests · {household.invitationStatus}</p>
                </div>
                <code className="rounded-full border border-[#eaded7] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">{household.inviteCode}</code>
              </div>
            </summary>
            <AdminActionForm action={saveHouseholdAction} className="mt-5 space-y-4 border-t border-[#eaded7] pt-5" successMessage="Household updated.">
              <HouseholdFields household={household} />
              <button className="btn btn-primary w-full">Update household</button>
            </AdminActionForm>
            <div className="mt-3 flex justify-between text-sm text-[#6a5c55]">
              <span>Guests: {household.guests.map((guest) => `${guest.firstName} ${guest.lastName}`).join(", ") || "None"}</span>
              <DeleteButton id={household.id} type="household" />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function HouseholdFields({ household }: { household?: HouseholdWithGuests }) {
  const id = household?.id || "new";
  return (
    <>
      {household ? <input type="hidden" name="id" value={household.id} /> : null}
      <label htmlFor={`household-name-${id}`}>Household name</label>
      <input id={`household-name-${id}`} name="name" placeholder="The Rowell Household" defaultValue={household?.name || ""} required />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`primaryEmail-${id}`}>Primary email</label>
          <input id={`primaryEmail-${id}`} name="primaryEmail" type="email" placeholder="name@example.com" defaultValue={household?.primaryEmail || ""} />
        </div>
        <div>
          <label htmlFor={`primaryPhone-${id}`}>Primary phone</label>
          <input id={`primaryPhone-${id}`} name="primaryPhone" type="tel" placeholder="612-555-0101" defaultValue={household?.primaryPhone || ""} />
        </div>
      </div>
      <label htmlFor={`mailingAddressLine1-${id}`}>Mailing address</label>
      <input id={`mailingAddressLine1-${id}`} name="mailingAddressLine1" placeholder="Address line 1" autoComplete="street-address" defaultValue={household?.mailingAddressLine1 || ""} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`household-city-${id}`}>City</label>
          <input id={`household-city-${id}`} name="city" placeholder="Minneapolis" autoComplete="address-level2" defaultValue={household?.city || ""} />
        </div>
        <div>
          <label htmlFor={`household-state-${id}`}>State</label>
          <select id={`household-state-${id}`} name="state" autoComplete="address-level1" defaultValue={household?.state || "MN"}>
            {states.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`household-postal-${id}`}>ZIP code</label>
          <input id={`household-postal-${id}`} name="postalCode" placeholder="55414" inputMode="numeric" pattern="\\d{5}(-\\d{4})?" title="Use a 5-digit ZIP code or ZIP+4." autoComplete="postal-code" defaultValue={household?.postalCode || ""} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`inviteCode-${id}`}>Invite code</label>
          <input id={`inviteCode-${id}`} name="inviteCode" placeholder="ROWELL2027" pattern="[A-Z0-9-]{4,32}" title="Use 4-32 uppercase letters, numbers, or hyphens." defaultValue={household?.inviteCode || ""} required />
        </div>
        <div>
          <label htmlFor={`inviteLinkToken-${id}`}>Invite token</label>
          <input id={`inviteLinkToken-${id}`} name="inviteLinkToken" placeholder="secure-token" pattern="[A-Za-z0-9_-]{10,80}" title="Use 10-80 letters, numbers, underscores, or hyphens." defaultValue={household?.inviteLinkToken || ""} required />
        </div>
      </div>
      <label htmlFor={`household-notes-${id}`}>Notes</label>
      <textarea id={`household-notes-${id}`} name="notes" placeholder="Notes" rows={3} defaultValue={household?.notes || ""} />
    </>
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
                  <AdminActionForm action={updateRsvpAction} className="grid min-w-52 gap-2" successMessage="RSVP updated.">
                    <input type="hidden" name="id" value={rsvp.id} />
                    <label htmlFor={`attending-${rsvp.id}`}>Attendance</label>
                    <select id={`attending-${rsvp.id}`} name="attending" defaultValue={rsvp.attending}>
                      <option>YES</option><option>NO</option><option>UNANSWERED</option>
                    </select>
                    <label htmlFor={`meal-${rsvp.id}`}>Meal choice</label>
                    <input id={`meal-${rsvp.id}`} name="mealChoice" defaultValue={rsvp.mealChoice || ""} placeholder="Meal" />
                    <label htmlFor={`dietary-${rsvp.id}`}>Dietary notes</label>
                    <input id={`dietary-${rsvp.id}`} name="dietaryRestrictions" defaultValue={rsvp.dietaryRestrictions || ""} placeholder="Dietary notes" />
                    <button className="btn btn-secondary">Save</button>
                  </AdminActionForm>
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

const states = [
  ["", "Select state"],
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

function EventFields({ event }: { event?: EventRecord }) {
  return (
    <>
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <label htmlFor={`title-${event?.id || "new"}`}>Event title</label>
      <input id={`title-${event?.id || "new"}`} name="title" placeholder="Ceremony" defaultValue={event?.title || ""} required />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`slug-${event?.id || "new"}`}>URL slug</label>
          <input id={`slug-${event?.id || "new"}`} name="slug" placeholder="ceremony" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title="Use lowercase letters, numbers, and hyphens only." defaultValue={event?.slug || ""} required />
        </div>
        <div>
          <label htmlFor={`type-${event?.id || "new"}`}>Event type</label>
          <select id={`type-${event?.id || "new"}`} name="type" defaultValue={event?.type || ""} required>
            <option value="">Select type</option>
            {["Dowry", "Ceremony", "Cocktail Hour", "Reception", "After Party", "After Party Cookout", "Farewell Brunch", "Rehearsal Dinner", "Welcome Party"].map((type) => <option key={type}>{type}</option>)}
          </select>
        </div>
      </div>
      <label htmlFor={`description-${event?.id || "new"}`}>Description</label>
      <textarea name="description" placeholder="Description" rows={3} defaultValue={event?.description || ""} required />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`date-${event?.id || "new"}`}>Date</label>
          <input id={`date-${event?.id || "new"}`} name="date" type="date" defaultValue={event ? chicagoDateInputValue(event.date) : ""} required />
        </div>
        <div>
          <label htmlFor={`startTime-${event?.id || "new"}`}>Start time</label>
          <input id={`startTime-${event?.id || "new"}`} name="startTime" type="time" step="900" defaultValue={timeInputValue(event?.startTime)} />
          <p className="mt-1 text-xs text-[#6a5c55]">Leave blank for TBD.</p>
        </div>
        <div>
          <label htmlFor={`endTime-${event?.id || "new"}`}>End time</label>
          <input id={`endTime-${event?.id || "new"}`} name="endTime" type="time" step="900" defaultValue={timeInputValue(event?.endTime)} />
        </div>
      </div>
      <label htmlFor={`venueName-${event?.id || "new"}`}>Venue name</label>
      <input id={`venueName-${event?.id || "new"}`} name="venueName" placeholder="Urban Daisy" defaultValue={event?.venueName || ""} required />
      <label htmlFor={`addressLine1-${event?.id || "new"}`}>Street address</label>
      <input id={`addressLine1-${event?.id || "new"}`} name="addressLine1" placeholder="1621 E Hennepin Ave" autoComplete="street-address" defaultValue={event?.addressLine1 || ""} required />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`city-${event?.id || "new"}`}>City</label>
          <input id={`city-${event?.id || "new"}`} name="city" placeholder="Minneapolis" autoComplete="address-level2" defaultValue={event?.city || ""} required />
        </div>
        <div>
          <label htmlFor={`state-${event?.id || "new"}`}>State</label>
          <select id={`state-${event?.id || "new"}`} name="state" autoComplete="address-level1" defaultValue={event?.state || "MN"} required>
            {states.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`postalCode-${event?.id || "new"}`}>ZIP code</label>
          <input id={`postalCode-${event?.id || "new"}`} name="postalCode" placeholder="55414" inputMode="numeric" pattern="\\d{5}(-\\d{4})?" title="Use a 5-digit ZIP code or ZIP+4." autoComplete="postal-code" defaultValue={event?.postalCode || ""} />
        </div>
      </div>
      {event && event.mapUrl ? <a className="text-sm font-bold text-[#9b7039] underline" href={event.mapUrl} target="_blank" rel="noreferrer">Verify address in map</a> : null}
      <label htmlFor={`visibility-${event?.id || "new"}`}>Visibility</label>
      <select name="visibility" defaultValue={event?.visibility || "PUBLIC"}>
        <option value="PUBLIC">Public</option>
        <option value="PRIVATE">Private</option>
        <option value="INVITE_ONLY">Invite-only</option>
      </select>
      <label htmlFor={`mealOptions-${event?.id || "new"}`}>Meal options</label>
      <input name="mealOptions" placeholder="Meal options separated with |" defaultValue={event?.mealOptions || ""} />
      <label htmlFor={`parkingInfo-${event?.id || "new"}`}>Parking information</label>
      <textarea name="parkingInfo" placeholder="Parking info" rows={2} defaultValue={event?.parkingInfo || ""} />
      <label htmlFor={`transportationInfo-${event?.id || "new"}`}>Transportation information</label>
      <textarea name="transportationInfo" placeholder="Transportation info" rows={2} defaultValue={event?.transportationInfo || ""} />
      <label htmlFor={`dressCode-${event?.id || "new"}`}>Dress code</label>
      <input name="dressCode" placeholder="Dress code" defaultValue={event?.dressCode || ""} />
      <label htmlFor={`mapUrl-${event?.id || "new"}`}>Map URL</label>
      <input id={`mapUrl-${event?.id || "new"}`} name="mapUrl" type="url" placeholder="https://maps.google.com/..." defaultValue={event?.mapUrl || ""} />
      <label htmlFor={`sortOrder-${event?.id || "new"}`}>Sort order</label>
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
        <AdminActionForm action={saveEventAction} resetOnSuccess className="card space-y-4 p-5" successMessage="Event saved.">
          <h2 className="serif text-3xl font-bold">Add event</h2>
          <EventFields />
          <button className="btn btn-primary w-full">Save event</button>
        </AdminActionForm>
        <AdminActionForm action={assignHouseholdToEventAction} resetOnSuccess className="card space-y-4 p-5" successMessage="Household invited.">
          <h2 className="serif text-3xl font-bold">Assign household</h2>
          <select name="eventId" required><option value="">Select event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select>
          <select name="householdId" required><option value="">Select household</option>{households.map((household) => <option key={household.id} value={household.id}>{household.name}</option>)}</select>
          <button className="btn btn-secondary w-full">Invite household to event</button>
        </AdminActionForm>
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
                    {event.date.toLocaleDateString()} · {formatTimeForDisplay(event.startTime)}
                    {event.endTime ? ` - ${formatTimeForDisplay(event.endTime)}` : ""} · {event.venueName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#eaded7] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">{event.visibility}</span>
                  <span className="rounded-full border border-[#eaded7] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">{event.isActive ? "Active" : "Hidden"}</span>
                </div>
              </div>
            </summary>
            <AdminActionForm action={saveEventAction} className="mt-5 space-y-4 border-t border-[#eaded7] pt-5" successMessage="Event updated.">
              <EventFields event={event} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <button className="btn btn-primary flex-1">Update event</button>
              </div>
            </AdminActionForm>
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
  return <StructuredManager type="registry" title="registry link" rows={links} action={saveRegistryAction} fields={registryFields} />;
}

async function FaqManager() {
  const rows = await prisma.fAQItem.findMany({ orderBy: { sortOrder: "asc" } });
  return <StructuredManager type="faq" title="FAQ item" rows={rows} action={saveFaqAction} fields={faqFields} />;
}

async function TravelManager() {
  const rows = await prisma.travelSection.findMany({ orderBy: { sortOrder: "asc" } });
  return <StructuredManager type="travel" title="travel section" rows={rows} action={saveTravelAction} fields={travelFields} />;
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

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "url" | "number" | "textarea" | "select";
  required?: boolean;
  rows?: number;
  placeholder?: string;
  options?: string[];
};

const faqFields: FieldConfig[] = [
  { name: "question", label: "Question", required: true, placeholder: "What should I wear?" },
  { name: "answer", label: "Answer", type: "textarea", rows: 5, required: true, placeholder: "Share the guest-facing answer." },
  { name: "category", label: "Category", type: "select", required: true, options: ["General", "RSVP", "Schedule", "Travel", "Attire", "Family", "Parking"] },
  { name: "sortOrder", label: "Sort order", type: "number" },
];

const registryFields: FieldConfig[] = [
  { name: "title", label: "Registry title", required: true, placeholder: "Honeymoon Fund" },
  { name: "description", label: "Description", type: "textarea", rows: 4, required: true },
  { name: "url", label: "Registry URL", type: "url", required: true, placeholder: "https://..." },
  { name: "buttonText", label: "Button text", required: true, placeholder: "Open registry" },
  { name: "sortOrder", label: "Sort order", type: "number" },
];

const travelFields: FieldConfig[] = [
  { name: "title", label: "Title", required: true, placeholder: "Hotel Block" },
  { name: "content", label: "Content", type: "textarea", rows: 5, required: true },
  { name: "category", label: "Category", type: "select", required: true, options: ["Hotel", "Airport", "Transportation", "Parking", "Local", "Weather", "Things to do"] },
  { name: "url", label: "URL", type: "url", placeholder: "https://..." },
  { name: "sortOrder", label: "Sort order", type: "number" },
];

function StructuredFields({ row, fields }: { row?: Record<string, unknown> & { id?: string; isActive?: boolean }; fields: FieldConfig[] }) {
  const id = row?.id || "new";
  return (
    <>
      {row?.id ? <input type="hidden" name="id" value={row.id} /> : null}
      {fields.map((field) => {
        const fieldId = `${field.name}-${id}`;
        const value = String(row?.[field.name] ?? (field.name === "sortOrder" ? 0 : ""));
        if (field.type === "textarea") {
          return (
            <div key={field.name}>
              <label htmlFor={fieldId}>{field.label}</label>
              <textarea id={fieldId} name={field.name} rows={field.rows || 4} placeholder={field.placeholder} defaultValue={value} required={field.required} />
            </div>
          );
        }
        if (field.type === "select") {
          return (
            <div key={field.name}>
              <label htmlFor={fieldId}>{field.label}</label>
              <select id={fieldId} name={field.name} defaultValue={value || field.options?.[0] || ""} required={field.required}>
                {field.options?.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
          );
        }
        return (
          <div key={field.name}>
            <label htmlFor={fieldId}>{field.label}</label>
            <input id={fieldId} name={field.name} type={field.type || "text"} placeholder={field.placeholder} defaultValue={value} required={field.required} />
          </div>
        );
      })}
      <label className="mb-0 flex items-center gap-2"><input className="h-4 w-4" name="isActive" type="checkbox" defaultChecked={row?.isActive ?? true} /> Active</label>
    </>
  );
}

function StructuredManager({ type, title, rows, action, fields }: { type: string; title: string; rows: Array<Record<string, unknown> & { id: string; isActive?: boolean }>; action: (formData: FormData) => Promise<void>; fields: FieldConfig[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <AdminActionForm action={action} resetOnSuccess className="card space-y-4 p-5" successMessage={`${title} saved.`}>
        <h2 className="serif text-3xl font-bold">Add {title}</h2>
        <StructuredFields fields={fields} />
        <button className="btn btn-primary w-full">Save</button>
      </AdminActionForm>
      <div className="grid gap-4">
        {rows.map((row) => (
          <details key={row.id} className="card p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b76768]">Edit {title}</p>
                  <h2 className="serif text-3xl font-bold">{String(row[fields[0].name] || title)}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-[#6a5c55]">{String(row[fields[1]?.name] || "")}</p>
                </div>
                <span className="rounded-full border border-[#eaded7] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">{row.isActive ? "Active" : "Hidden"}</span>
              </div>
            </summary>
            <AdminActionForm action={action} className="mt-5 space-y-4 border-t border-[#eaded7] pt-5" successMessage={`${title} updated.`}>
              <StructuredFields row={row} fields={fields} />
              <button className="btn btn-primary w-full">Update</button>
            </AdminActionForm>
            <div className="mt-3 flex justify-end">
              <DeleteButton id={row.id} type={type} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

async function ContentManager() {
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {settings.map((setting) => (
        <AdminActionForm key={setting.id} action={saveSettingAction} className="card space-y-3 p-5" successMessage="Setting saved.">
          <input type="hidden" name="key" value={setting.key} />
          <label htmlFor={setting.key}>{setting.key}</label>
          <textarea id={setting.key} name="value" defaultValue={setting.value} rows={setting.value.length > 80 ? 5 : 2} />
          <button className="btn btn-secondary">Save setting</button>
        </AdminActionForm>
      ))}
    </div>
  );
}
