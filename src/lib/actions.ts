"use server";

import { randomUUID } from "crypto";
import type { GuestSide } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, requireAdmin, setAdminSession, validateAdminLogin } from "@/lib/auth";
import { dateAtChicagoTime, timeInputValue } from "@/lib/event-time";
import { prisma } from "@/lib/prisma";

const required = z.string().trim().min(1);
const optionalEmail = z.string().trim().email().optional().or(z.literal(""));
const optionalUrl = z.string().trim().url().optional().or(z.literal(""));
const inviteCodeSchema = z.string().trim().regex(/^[A-Z0-9-]{4,32}$/);
const inviteTokenSchema = z.string().trim().regex(/^[A-Za-z0-9_-]{10,80}$/);

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = z.object({ email: z.string().email(), password: required }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const admin = await validateAdminLogin(parsed.data.email, parsed.data.password);
  if (!admin) return { error: "Those login details do not match an admin account." };
  await setAdminSession(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function submitRsvpAction(formData: FormData) {
  const householdId = String(formData.get("householdId") || "");
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    include: { guests: true, eventInvitations: true },
  });
  if (!household) redirect("/rsvp?error=not-found");

  const allowed = new Set(household.eventInvitations.filter((invite) => invite.invited && invite.guestId).map((invite) => `${invite.eventId}:${invite.guestId}`));

  for (const guest of household.guests) {
    const plusOneName = String(formData.get(`plusOneName:${guest.id}`) || "").trim();
    if (guest.plusOneAllowed && plusOneName) {
      await prisma.guest.update({ where: { id: guest.id }, data: { plusOneName } });
    }

    const invitedEventIds = household.eventInvitations
      .filter((invite) => invite.guestId === guest.id && invite.invited)
      .map((invite) => invite.eventId);

    for (const eventId of invitedEventIds) {
      if (!allowed.has(`${eventId}:${guest.id}`)) continue;
      const attending = String(formData.get(`attending:${guest.id}:${eventId}`) || "UNANSWERED");
      if (!["YES", "NO", "UNANSWERED"].includes(attending)) continue;
      await prisma.rSVP.upsert({
        where: { eventId_guestId: { eventId, guestId: guest.id } },
        update: {
          attending: attending as "YES" | "NO" | "UNANSWERED",
          mealChoice: String(formData.get(`meal:${guest.id}:${eventId}`) || "").trim() || null,
          dietaryRestrictions: String(formData.get(`dietary:${guest.id}:${eventId}`) || "").trim() || null,
          accessibilityNeeds: String(formData.get(`accessibility:${guest.id}:${eventId}`) || "").trim() || null,
          songRequest: String(formData.get(`song:${guest.id}:${eventId}`) || "").trim() || null,
          travelNotes: String(formData.get(`travel:${guest.id}:${eventId}`) || "").trim() || null,
          submittedAt: new Date(),
        },
        create: {
          eventId,
          guestId: guest.id,
          householdId: household.id,
          attending: attending as "YES" | "NO" | "UNANSWERED",
          mealChoice: String(formData.get(`meal:${guest.id}:${eventId}`) || "").trim() || null,
          dietaryRestrictions: String(formData.get(`dietary:${guest.id}:${eventId}`) || "").trim() || null,
          accessibilityNeeds: String(formData.get(`accessibility:${guest.id}:${eventId}`) || "").trim() || null,
          songRequest: String(formData.get(`song:${guest.id}:${eventId}`) || "").trim() || null,
          travelNotes: String(formData.get(`travel:${guest.id}:${eventId}`) || "").trim() || null,
          submittedAt: new Date(),
        },
      });
    }
  }

  await prisma.household.update({ where: { id: household.id }, data: { invitationStatus: "RSVP_COMPLETE" } });
  redirect(`/invite/${household.inviteLinkToken}?submitted=1`);
}

export async function submitGuestbookAction(formData: FormData) {
  const parsed = z.object({
    name: z.string().trim().min(2).max(80),
    message: z.string().trim().min(4).max(700),
    token: z.string().trim().optional(),
  }).safeParse({
    name: formData.get("name"),
    message: formData.get("message"),
    token: formData.get("token"),
  });
  if (!parsed.success) redirect("/guestbook?error=invalid");
  const household = parsed.data.token ? await prisma.household.findUnique({ where: { inviteLinkToken: parsed.data.token } }) : null;
  await prisma.guestbookEntry.create({
    data: {
      name: parsed.data.name,
      message: parsed.data.message,
      householdId: household?.id,
      isApproved: true,
    },
  });
  revalidatePath("/guestbook");
  redirect("/guestbook?submitted=1");
}

export async function saveHouseholdAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = z.object({
    name: required,
    primaryEmail: optionalEmail,
    primaryPhone: z.string().trim().optional(),
    mailingAddressLine1: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().length(2).optional().or(z.literal("")),
    postalCode: z.string().trim().regex(/^\d{5}(-\d{4})?$/).optional().or(z.literal("")),
    inviteCode: inviteCodeSchema,
    inviteLinkToken: inviteTokenSchema,
    notes: z.string().trim().optional(),
  }).safeParse({
    name: formData.get("name"),
    primaryEmail: formData.get("primaryEmail"),
    primaryPhone: formData.get("primaryPhone"),
    mailingAddressLine1: formData.get("mailingAddressLine1"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    inviteCode: String(formData.get("inviteCode") || "").toUpperCase(),
    inviteLinkToken: formData.get("inviteLinkToken"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return;
  const data = {
    ...parsed.data,
    primaryEmail: parsed.data.primaryEmail || null,
    primaryPhone: parsed.data.primaryPhone || null,
    mailingAddressLine1: parsed.data.mailingAddressLine1 || null,
    city: parsed.data.city || null,
    state: parsed.data.state || null,
    postalCode: parsed.data.postalCode || null,
    notes: parsed.data.notes || null,
  };
  if (id) await prisma.household.update({ where: { id }, data });
  else await prisma.household.create({ data: { ...data, country: "United States" } });
  revalidatePath("/admin/manage/households");
}

export async function saveGuestAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = z.object({
    householdId: required,
    firstName: required,
    lastName: required,
    email: optionalEmail,
    phone: z.string().trim().optional(),
    relationshipGroup: z.string().trim().optional(),
    guestSide: z.enum(["ANDRE", "BEBE", "BOTH"]).default("BOTH"),
    tags: z.string().trim().optional(),
    plusOneName: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  }).safeParse({
    householdId: formData.get("householdId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    relationshipGroup: formData.get("relationshipGroup"),
    guestSide: formData.get("guestSide") || "BOTH",
    tags: formData.get("tags"),
    plusOneName: formData.get("plusOneName"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return;
  const data = {
    householdId: parsed.data.householdId,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    isAdult: formData.get("isAdult") === "on",
    isChild: formData.get("isChild") === "on",
    plusOneAllowed: formData.get("plusOneAllowed") === "on",
    plusOneName: parsed.data.plusOneName || null,
    guestSide: parsed.data.guestSide,
    relationshipGroup: parsed.data.relationshipGroup || null,
    tags: parsed.data.tags || null,
    notes: parsed.data.notes || null,
  };
  if (id) await prisma.guest.update({ where: { id }, data });
  else await prisma.guest.create({ data });
  revalidatePath("/admin/manage/guests");
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted && char === '"' && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(value);
      value = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function truthy(value?: string) {
  return ["1", "true", "yes", "y", "on"].includes((value || "").trim().toLowerCase());
}

function normalizeGuestSide(value?: string) {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "andre") return "ANDRE" as GuestSide;
  if (normalized === "bebe") return "BEBE" as GuestSide;
  return "BOTH" as GuestSide;
}

function tokenFromHousehold(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${randomUUID().slice(0, 8)}`;
}

export async function importGuestsCsvAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("csvFile");
  const textInput = String(formData.get("csvText") || "").trim();
  const text = file instanceof File && file.size > 0 ? await file.text() : textInput;
  if (!text) return;

  const rows = parseCsvRows(text);
  const headers = rows.shift()?.map((header) => header.trim().toLowerCase()) || [];
  const index = (name: string) => headers.indexOf(name);
  const value = (row: string[], ...names: string[]) => {
    for (const name of names) {
      const found = index(name);
      if (found >= 0) return row[found]?.trim() || "";
    }
    return "";
  };

  for (const row of rows) {
    const firstName = value(row, "first", "firstname", "first name");
    const lastName = value(row, "last", "lastname", "last name");
    const householdName = value(row, "household", "householdname", "household name") || `${lastName || firstName} Household`;
    if (!firstName || !lastName || !householdName) continue;

    const inviteCode = (value(row, "invitecode", "invite code") || householdName.replace(/[^a-z0-9]/gi, "").slice(0, 16) || randomUUID().slice(0, 8)).toUpperCase();
    const household = await prisma.household.upsert({
      where: { inviteCode },
      update: {
        name: householdName,
        primaryEmail: value(row, "householdemail", "primaryemail", "primary email") || value(row, "email") || null,
        primaryPhone: value(row, "householdphone", "primaryphone", "primary phone") || value(row, "phone") || null,
        mailingAddressLine1: value(row, "address", "address1", "mailingaddressline1") || null,
        city: value(row, "city") || null,
        state: value(row, "state") || null,
        postalCode: value(row, "zip", "zipcode", "postalcode", "postal code") || null,
      },
      create: {
        name: householdName,
        primaryEmail: value(row, "householdemail", "primaryemail", "primary email") || value(row, "email") || null,
        primaryPhone: value(row, "householdphone", "primaryphone", "primary phone") || value(row, "phone") || null,
        mailingAddressLine1: value(row, "address", "address1", "mailingaddressline1") || null,
        city: value(row, "city") || null,
        state: value(row, "state") || null,
        postalCode: value(row, "zip", "zipcode", "postalcode", "postal code") || null,
        inviteCode,
        inviteLinkToken: value(row, "invitetoken", "invite token") || tokenFromHousehold(householdName),
      },
    });

    const email = value(row, "email") || null;
    const guestData = {
      householdId: household.id,
      firstName,
      lastName,
      email,
      phone: value(row, "phone") || null,
      guestSide: normalizeGuestSide(value(row, "side", "guestside", "guest side")),
      relationshipGroup: value(row, "relationshipgroup", "relationship group", "group") || null,
      tags: value(row, "tags") || null,
      notes: value(row, "notes") || null,
      isAdult: !truthy(value(row, "ischild", "is child", "child")),
      isChild: truthy(value(row, "ischild", "is child", "child")),
      plusOneAllowed: truthy(value(row, "plusoneallowed", "plus one allowed", "plusone")),
      plusOneName: value(row, "plusonename", "plus one name") || null,
    };

    const existing = email ? await prisma.guest.findFirst({ where: { email } }) : null;
    if (existing) await prisma.guest.update({ where: { id: existing.id }, data: guestData });
    else await prisma.guest.create({ data: guestData });
  }

  revalidatePath("/admin/manage/guests");
  revalidatePath("/admin");
}

export async function saveEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const rawDate = String(formData.get("date") || "").trim();
  const startTime = timeInputValue(String(formData.get("startTime") || "")) || "TBD";
  const endTime = timeInputValue(String(formData.get("endTime") || "")) || null;
  const mapUrlValue = String(formData.get("mapUrl") || "").trim();
  const addressLine1 = String(formData.get("addressLine1") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const generatedMapUrl = addressLine1.toUpperCase().includes("TBD") || city.toUpperCase() === "TBD" || !state
    ? null
    : `https://maps.google.com/?q=${encodeURIComponent(`${addressLine1}, ${city}, ${state}`)}`;
  let mapUrl = generatedMapUrl;
  if (mapUrlValue) {
    try {
      const parsed = new URL(mapUrlValue);
      mapUrl = parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : generatedMapUrl;
    } catch {
      mapUrl = generatedMapUrl;
    }
  }
  const data = {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    type: String(formData.get("type") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    date: dateAtChicagoTime(rawDate, startTime),
    startTime,
    endTime,
    venueName: String(formData.get("venueName") || "").trim(),
    addressLine1,
    city,
    state,
    postalCode: String(formData.get("postalCode") || "").trim() || null,
    mapUrl,
    dressCode: String(formData.get("dressCode") || "").trim() || null,
    parkingInfo: String(formData.get("parkingInfo") || "").trim() || null,
    transportationInfo: String(formData.get("transportationInfo") || "").trim() || null,
    visibility: String(formData.get("visibility") || "PUBLIC") as "PUBLIC" | "PRIVATE" | "INVITE_ONLY",
    rsvpRequired: formData.get("rsvpRequired") === "on",
    mealSelectionRequired: formData.get("mealSelectionRequired") === "on",
    mealOptions: String(formData.get("mealOptions") || "").trim() || null,
    sortOrder: Number(formData.get("sortOrder") || 0),
    isActive: formData.get("isActive") === "on",
  };
  const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug);
  if (!rawDate || !data.title || !validSlug || !data.type || !data.venueName || !data.addressLine1 || !data.city || !data.state) return;
  if (id) await prisma.event.update({ where: { id }, data });
  else await prisma.event.create({ data });
  revalidatePath("/");
  revalidatePath("/admin/manage/events");
  revalidatePath("/events");
  revalidatePath("/day-of");
}

export async function assignHouseholdToEventAction(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId") || "");
  const householdId = String(formData.get("householdId") || "");
  const guests = await prisma.guest.findMany({ where: { householdId } });
  for (const guest of guests) {
    await prisma.eventInvitation.upsert({
      where: { eventId_guestId: { eventId, guestId: guest.id } },
      update: { invited: true, householdId },
      create: { eventId, guestId: guest.id, householdId, invited: true },
    });
  }
  revalidatePath("/admin/manage/events");
}

export async function saveRegistryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = z.object({
    title: required,
    description: required,
    url: z.string().trim().url(),
    buttonText: required,
    sortOrder: z.coerce.number().int().default(0),
  }).safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    url: formData.get("url"),
    buttonText: formData.get("buttonText") || "Open registry",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) return;
  const data = {
    ...parsed.data,
    isActive: formData.get("isActive") === "on",
  };
  if (id) await prisma.registryLink.update({ where: { id }, data });
  else await prisma.registryLink.create({ data });
  revalidatePath("/admin/manage/registry");
  revalidatePath("/registry");
}

export async function saveFaqAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = z.object({
    question: required,
    answer: required,
    category: required,
    sortOrder: z.coerce.number().int().default(0),
  }).safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category") || "General",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) return;
  const data = {
    ...parsed.data,
    isActive: formData.get("isActive") === "on",
  };
  if (id) await prisma.fAQItem.update({ where: { id }, data });
  else await prisma.fAQItem.create({ data });
  revalidatePath("/admin/manage/faqs");
  revalidatePath("/faq");
}

export async function saveTravelAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = z.object({
    title: required,
    content: required,
    category: required,
    url: optionalUrl,
    sortOrder: z.coerce.number().int().default(0),
  }).safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category") || "Travel",
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) return;
  const data = {
    ...parsed.data,
    url: parsed.data.url || null,
    isActive: formData.get("isActive") === "on",
  };
  if (id) await prisma.travelSection.update({ where: { id }, data });
  else await prisma.travelSection.create({ data });
  revalidatePath("/admin/manage/travel");
  revalidatePath("/travel");
}

export async function saveSettingAction(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("key") || "").trim();
  const value = String(formData.get("value") || "").trim();
  if (!key) return;
  await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/");
  revalidatePath("/admin/manage/content");
  revalidatePath("/day-of");
  revalidatePath("/after");
}

export async function saveSiteModeAction(formData: FormData) {
  await requireAdmin();
  const mode = String(formData.get("siteMode") || "wedding").trim();
  if (!["wedding", "day-of", "after"].includes(mode)) return;
  await prisma.siteSetting.upsert({ where: { key: "siteMode" }, update: { value: mode }, create: { key: "siteMode", value: mode } });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function moderateGuestbookAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const action = String(formData.get("guestbookAction") || "");
  if (!id) return;
  if (action === "delete") await prisma.guestbookEntry.delete({ where: { id } });
  if (action === "approve") await prisma.guestbookEntry.update({ where: { id }, data: { isApproved: true } });
  if (action === "hide") await prisma.guestbookEntry.update({ where: { id }, data: { isApproved: false } });
  revalidatePath("/guestbook");
  revalidatePath("/admin/manage/guestbook");
}

export async function updateRsvpAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const attending = String(formData.get("attending") || "UNANSWERED") as "YES" | "NO" | "UNANSWERED";
  if (!id || !["YES", "NO", "UNANSWERED"].includes(attending)) return;
  await prisma.rSVP.update({
    where: { id },
    data: {
      attending,
      mealChoice: String(formData.get("mealChoice") || "").trim() || null,
      dietaryRestrictions: String(formData.get("dietaryRestrictions") || "").trim() || null,
    },
  });
  revalidatePath("/admin/manage/rsvps");
}

export async function deleteEntityAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const type = String(formData.get("type") || "");
  if (!id) return;
  if (type === "guest") await prisma.guest.delete({ where: { id } });
  if (type === "household") await prisma.household.delete({ where: { id } });
  if (type === "event") await prisma.event.delete({ where: { id } });
  if (type === "registry") await prisma.registryLink.delete({ where: { id } });
  if (type === "faq") await prisma.fAQItem.delete({ where: { id } });
  if (type === "travel") await prisma.travelSection.delete({ where: { id } });
  if (type === "guestbook") await prisma.guestbookEntry.delete({ where: { id } });
  revalidatePath("/admin");
}
