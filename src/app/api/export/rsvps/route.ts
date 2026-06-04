import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { csvEscape } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const rsvps = await prisma.rSVP.findMany({ include: { guest: true, household: true, event: true }, orderBy: [{ event: { sortOrder: "asc" } }, { household: { name: "asc" } }] });
  const rows = [
    ["event", "household", "first_name", "last_name", "attending", "meal_choice", "dietary_restrictions", "accessibility_needs", "song_request", "travel_notes", "submitted_at"].map(csvEscape).join(","),
    ...rsvps.map((rsvp) =>
      [
        rsvp.event.title,
        rsvp.household.name,
        rsvp.guest.firstName,
        rsvp.guest.lastName,
        rsvp.attending,
        rsvp.mealChoice,
        rsvp.dietaryRestrictions,
        rsvp.accessibilityNeeds,
        rsvp.songRequest,
        rsvp.travelNotes,
        rsvp.submittedAt?.toISOString(),
      ].map(csvEscape).join(","),
    ),
  ];
  return new NextResponse(rows.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=andre-bebe-rsvps.csv",
    },
  });
}
