import { GuestPage, PageHero } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function TravelPage() {
  const sections = await prisma.travelSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <GuestPage>
      <PageHero eyebrow="Travel & stay" title="Make the weekend easy" copy="Hotel, airport, shuttle, parking, and local notes for guests coming to Minneapolis." />
      <section className="py-8 sm:py-10">
        <div className="container">
          <div className="section-frame dark-panel relative mb-5 overflow-hidden p-6 text-center sm:p-10">
            <img src="/photos/bebe-veil-car-bw.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-35" />
            <div className="relative">
              <h2 className="serif text-3xl font-semibold uppercase tracking-[0.06em] sm:text-4xl sm:tracking-[0.08em]">Travel guide</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#eaded1]">Find all the details you need for your trip and stay.</p>
            </div>
          </div>
        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.id} className="section-frame p-5 sm:p-6">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9b7039]">{section.category}</p>
              <h2 className="serif mt-2 text-2xl font-semibold uppercase tracking-[0.06em] sm:text-3xl sm:tracking-[0.08em]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#6a5c55]">{section.content}</p>
              {section.url ? <a className="btn btn-secondary mt-5" href={section.url} target="_blank" rel="noreferrer">Open link</a> : null}
            </article>
          ))}
        </div>
        </div>
      </section>
    </GuestPage>
  );
}
