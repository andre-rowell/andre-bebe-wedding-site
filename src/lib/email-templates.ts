import type { Event, Guest, Household, RSVP } from "@prisma/client";
import { formatDate } from "@/lib/format";

type HouseholdBundle = Household & {
  guests: Array<Guest & { rsvps?: Array<RSVP & { event: Event }> }>;
};

export function rsvpConfirmationTemplate(household: HouseholdBundle) {
  const lines = household.guests.flatMap((guest) =>
    (guest.rsvps || []).map((rsvp) => {
      const status = rsvp.attending === "YES" ? "Attending" : rsvp.attending === "NO" ? "Declined" : "Not answered";
      const meal = rsvp.mealChoice ? `, meal: ${rsvp.mealChoice}` : "";
      return `- ${guest.firstName} ${guest.lastName}: ${status} for ${rsvp.event.title}${meal}`;
    }),
  );

  return {
    subject: "Your RSVP for Andre & Bebe has been received",
    preview: "Thank you for celebrating with Andre and Bebe.",
    body: [
      `Hi ${household.name},`,
      "",
      "Thank you for submitting your RSVP for Andre & Bebe's wedding weekend. Here is what we have on file:",
      "",
      ...lines,
      "",
      "You can update your RSVP before the deadline using your invitation link:",
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/invite/${household.inviteLinkToken}`,
      "",
      "With love,",
      "Andre & Bebe",
    ].join("\n"),
  };
}

export function reminderTemplate(household: Household, missingEvents: Event[]) {
  const eventList = missingEvents.map((event) => `- ${event.title} on ${formatDate(event.date)}`).join("\n");
  return {
    subject: "Reminder: RSVP for Andre & Bebe",
    body: [
      `Hi ${household.name},`,
      "",
      "We would love to have your RSVP for Andre & Bebe's wedding weekend.",
      "",
      missingEvents.length ? `We are still missing responses for:\n${eventList}` : "We are still missing one or more responses from your household.",
      "",
      "Please use your private invitation link:",
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/invite/${household.inviteLinkToken}`,
      "",
      "Thank you!",
      "Andre & Bebe",
    ].join("\n"),
  };
}

export function dayOfMessageTemplate() {
  return {
    subject: "Andre & Bebe wedding day details",
    body: [
      "Today is the day. Here are the essentials:",
      "",
      "- Ceremony: 5:00 PM at Urban Daisy on May 30, 2027",
      "- Please arrive by 4:40 PM",
      "- Shuttle from the hotel block begins at 4:15 PM",
      "- Parking: venue lot and nearby street parking",
      "- Day-of contact: andrerowell@outlook.com",
      "",
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/day-of`,
    ].join("\n"),
  };
}
