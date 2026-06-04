"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, requireAdmin, setAdminSession, validateAdminLogin } from "@/lib/auth";
import { dateAtChicagoTime, timeInputValue } from "@/lib/event-time";
import { prisma } from "@/lib/prisma";

const required = z.string().trim().min(1);

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
  const data = {
    name: String(formData.get("name") || "").trim(),
    primaryEmail: String(formData.get("primaryEmail") || "").trim() || null,
    primaryPhone: String(formData.get("primaryPhone") || "").trim() || null,
    mailingAddressLine1: String(formData.get("mailingAddressLine1") || "").trim() || null,
    city: String(formData.get("city") || "").trim() || null,
    state: String(formData.get("state") || "").trim() || null,
    postalCode: String(formData.get("postalCode") || "").trim() || null,
    inviteCode: String(formData.get("inviteCode") || "").trim().toUpperCase(),
    inviteLinkToken: String(formData.get("inviteLinkToken") || "").trim(),
    notes: String(formData.get("notes") || "").trim() || null,
  };
  if (!data.name || !data.inviteCode || !data.inviteLinkToken) return;
  if (id) await prisma.household.update({ where: { id }, data });
  else await prisma.household.create({ data: { ...data, country: "United States" } });
  revalidatePath("/admin/manage/households");
}

export async function saveGuestAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    householdId: String(formData.get("householdId") || ""),
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    isAdult: formData.get("isAdult") === "on",
    isChild: formData.get("isChild") === "on",
    plusOneAllowed: formData.get("plusOneAllowed") === "on",
    relationshipGroup: String(formData.get("relationshipGroup") || "").trim() || null,
    tags: String(formData.get("tags") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };
  if (!data.householdId || !data.firstName || !data.lastName) return;
  if (id) await prisma.guest.update({ where: { id }, data });
  else await prisma.guest.create({ data });
  revalidatePath("/admin/manage/guests");
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
  const data = {
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    url: String(formData.get("url") || "").trim(),
    buttonText: String(formData.get("buttonText") || "Open registry").trim(),
    sortOrder: Number(formData.get("sortOrder") || 0),
    isActive: formData.get("isActive") === "on",
  };
  if (!data.title || !data.url) return;
  if (id) await prisma.registryLink.update({ where: { id }, data });
  else await prisma.registryLink.create({ data });
  revalidatePath("/admin/manage/registry");
  revalidatePath("/registry");
}

export async function saveFaqAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    question: String(formData.get("question") || "").trim(),
    answer: String(formData.get("answer") || "").trim(),
    category: String(formData.get("category") || "General").trim(),
    sortOrder: Number(formData.get("sortOrder") || 0),
    isActive: formData.get("isActive") === "on",
  };
  if (!data.question || !data.answer) return;
  if (id) await prisma.fAQItem.update({ where: { id }, data });
  else await prisma.fAQItem.create({ data });
  revalidatePath("/admin/manage/faqs");
  revalidatePath("/faq");
}

export async function saveTravelAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    title: String(formData.get("title") || "").trim(),
    content: String(formData.get("content") || "").trim(),
    category: String(formData.get("category") || "Travel").trim(),
    url: String(formData.get("url") || "").trim() || null,
    sortOrder: Number(formData.get("sortOrder") || 0),
    isActive: formData.get("isActive") === "on",
  };
  if (!data.title || !data.content) return;
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
