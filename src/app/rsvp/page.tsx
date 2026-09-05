import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { zolaRsvpUrl } from "@/lib/zola";

export const metadata: Metadata = {
  title: "RSVP",
  robots: { index: false, follow: false },
};

export default function RsvpPage() {
  redirect(zolaRsvpUrl);
}
