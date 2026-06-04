import { GuestPage, PageHero } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function StoryPage() {
  const settings = Object.fromEntries((await prisma.siteSetting.findMany()).map((item) => [item.key, item.value]));
  const timeline = [
    ["How We Met", "A first conversation that felt easy from the beginning."],
    ["First Date", "Good food, a long walk, and no rush to end the night."],
    ["Favorite Memories", "Family tables, travel days, shared playlists, and small rituals."],
    ["The Proposal", settings.proposalStory],
    ["Why We Are Excited", "Because our favorite people will be in one room as we begin marriage."],
  ];
  return (
    <GuestPage>
      <PageHero eyebrow="Our story" title="The life we are building" copy={settings.storyCopy || ""} />
      <section className="py-10">
        <div className="container grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div className="section-frame p-6">
            <div className="space-y-8 border-l border-[#caa46c] pl-6">
              {timeline.map(([title, copy], index) => (
                <div key={title} className="relative">
                  <span className="absolute -left-[1.9rem] top-1 h-3 w-3 rounded-full border border-[#b88948] bg-[#fbf7f0]" />
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9b7039]">{2017 + index}</p>
                  <h3 className="serif mt-1 text-2xl font-semibold uppercase tracking-[0.08em]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6d625b]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <img src="/photos/andre-bebe-car.jpg" alt="Andre and Bebe with a classic car" loading="lazy" decoding="async" className="h-[34rem] w-full rounded-sm object-cover object-center" />
        </div>
        <div className="container mt-8 grid gap-6 lg:grid-cols-2">
          <article className="section-frame overflow-hidden">
            <img src="/photos/andre-bebe-portrait.jpg" alt="Andre and Bebe engagement portrait" loading="lazy" decoding="async" className="h-80 w-full object-cover object-[58%_38%]" />
            <div className="p-6">
              <h2 className="serif text-4xl font-semibold">Andre</h2>
              <p className="mt-3 leading-7 text-[#6a5c55]">{settings.andreBio}</p>
            </div>
          </article>
          <article className="section-frame overflow-hidden">
            <img src="/photos/bebe-foreground.jpg" alt="Bebe portrait with Andre in the background" loading="lazy" decoding="async" className="h-80 w-full object-cover object-[55%_32%]" />
            <div className="p-6">
              <h2 className="serif text-4xl font-semibold">Bebe</h2>
              <p className="mt-3 leading-7 text-[#6a5c55]">{settings.bebeBio}</p>
            </div>
          </article>
        </div>
      </section>
    </GuestPage>
  );
}
