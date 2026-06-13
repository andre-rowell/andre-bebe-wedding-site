import { GuestPage, PageHero } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function FaqPage() {
  const faqs = await prisma.fAQItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <GuestPage>
      <PageHero eyebrow="FAQ" title="Good things to know" copy="A quick place for attire, schedule, parking, transportation, children, plus-ones, and RSVP questions." />
      <section className="py-8 sm:py-10">
        <div className="container grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="section-frame dark-panel relative min-h-72 overflow-hidden sm:min-h-96">
            <img src="/photos/andre-bebe-close.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-45" />
            <div className="absolute inset-0 bg-[#15110f]/45" />
            <div className="relative flex min-h-72 flex-col justify-end p-5 sm:min-h-96 sm:p-8">
              <p className="ornament text-sm">◆</p>
              <h2 className="serif mt-4 text-3xl font-semibold uppercase tracking-[0.06em] sm:text-4xl sm:tracking-[0.08em]">FAQ</h2>
              <p className="mt-3 text-sm leading-7 text-[#eaded1]">The answers most guests need before wedding weekend.</p>
            </div>
          </div>
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <details key={faq.id} className="section-frame p-5">
              <summary className="cursor-pointer list-none">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b7039]">{faq.category}</span>
                <h2 className="serif mt-1 text-xl font-semibold sm:text-2xl">{faq.question}</h2>
              </summary>
              <p className="mt-3 leading-7 text-[#6a5c55]">{faq.answer}</p>
            </details>
          ))}
        </div>
        </div>
      </section>
    </GuestPage>
  );
}
