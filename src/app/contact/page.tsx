import { Mail } from "lucide-react";
import { GuestPage, PageHero } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function ContactPage() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "contactEmail" } });
  const email = setting?.value || "andrerowell@outlook.com";
  return (
    <GuestPage>
      <PageHero eyebrow="Contact" title="Need help?" copy="Please check the FAQ first. If you still need anything, send a note and we will point you in the right direction." />
      <section className="py-10">
        <div className="container grid gap-6 lg:grid-cols-2">
          <div className="section-frame overflow-hidden">
            <img src="/photos/andre-bebe-car-embrace.jpg" alt="Andre and Bebe in a classic car" loading="lazy" decoding="async" className="h-80 w-full object-cover" />
            <div className="p-6">
            <Mail className="text-[#b76768]" />
            <h2 className="serif mt-4 text-4xl font-semibold">Wedding questions</h2>
            <p className="mt-3 leading-7 text-[#6a5c55]">For RSVP, hotel, shuttle, or weekend questions, email Andre and Bebe&apos;s wedding contact.</p>
            <a className="btn btn-primary mt-5" href={`mailto:${email}`}>{email}</a>
            </div>
          </div>
          <form className="section-frame space-y-4 p-6" action={`mailto:${email}`} method="post" encType="text/plain">
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" required />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} required />
            </div>
            <button className="btn btn-secondary">Prepare email</button>
          </form>
        </div>
      </section>
    </GuestPage>
  );
}
