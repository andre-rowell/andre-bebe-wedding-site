import { HeartHandshake } from "lucide-react";
import { GuestPage, PageHero } from "@/components/site-shell";
import { submitGuestbookAction } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function GuestbookPage({ searchParams }: { searchParams?: Promise<{ token?: string; submitted?: string; error?: string }> }) {
  const params = await searchParams;
  const entries = await prisma.guestbookEntry.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 40 });
  return (
    <GuestPage>
      <PageHero eyebrow="Guestbook" title="Leave a note" copy="Share a toast, memory, blessing, or favorite advice for Andre and Bebe." />
      <section className="py-8 sm:py-10">
        <div className="container grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <form action={submitGuestbookAction} className="section-frame space-y-4 p-5 sm:p-6">
            <input type="hidden" name="token" value={params?.token || ""} />
            <HeartHandshake className="text-[#9b7039]" />
            <h2 className="serif text-3xl font-semibold sm:text-4xl">Sign the guestbook</h2>
            {params?.submitted ? <p className="bg-[#edf6ec] p-3 text-sm font-semibold text-[#3f7040]">Thank you. Your message has been added.</p> : null}
            {params?.error ? <p className="bg-[#fff1ec] p-3 text-sm font-semibold text-[#8f403d]">Please add your name and a short message.</p> : null}
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" required maxLength={80} />
            </div>
            <div>
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={7} required maxLength={700} />
            </div>
            <button className="btn btn-primary w-full">Add message</button>
          </form>
          <div className="grid gap-4 sm:grid-cols-2">
            {entries.map((entry) => (
              <article key={entry.id} className="section-frame p-5">
                <p className="script text-xl leading-snug text-[#6e5d52] sm:text-2xl">“{entry.message}”</p>
                <p className="mt-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9b7039]">{entry.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </GuestPage>
  );
}
