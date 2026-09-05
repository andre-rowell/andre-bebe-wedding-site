import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { zolaRegistryUrl } from "@/lib/zola";

export const metadata: Metadata = {
  title: "Registry",
  robots: { index: false, follow: false },
};

export default function RegistryPage() {
  redirect(zolaRegistryUrl);
}
