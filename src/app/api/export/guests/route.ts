import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { csvEscape } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const guests = await prisma.guest.findMany({ include: { household: true }, orderBy: [{ household: { name: "asc" } }, { lastName: "asc" }] });
  const rows = [
    ["household", "invite_code", "first_name", "last_name", "email", "phone", "adult", "child", "plus_one_allowed", "relationship_group", "tags", "invitation_status", "address"].map(csvEscape).join(","),
    ...guests.map((guest) =>
      [
        guest.household.name,
        guest.household.inviteCode,
        guest.firstName,
        guest.lastName,
        guest.email,
        guest.phone,
        guest.isAdult,
        guest.isChild,
        guest.plusOneAllowed,
        guest.relationshipGroup,
        guest.tags,
        guest.household.invitationStatus,
        [guest.household.mailingAddressLine1, guest.household.city, guest.household.state, guest.household.postalCode].filter(Boolean).join(" "),
      ].map(csvEscape).join(","),
    ),
  ];
  return new NextResponse(rows.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=andre-bebe-guests.csv",
    },
  });
}
