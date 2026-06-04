import { Gift } from "lucide-react";
import { GuestPage, PageHero } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function RegistryPage() {
  const links = await prisma.registryLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <GuestPage>
      <PageHero eyebrow="Registry" title="Your presence is the gift" copy="We are grateful you are celebrating with us. If you would like to give something more, these links include a honeymoon fund and a few home pieces we love." />
      <section className="py-10">
        <div className="container grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="section-frame dark-panel overflow-hidden">
            <img src="/photos/andre-bebe-car-laugh.jpg" alt="Andre and Bebe laughing in a classic car" loading="lazy" decoding="async" className="h-96 w-full object-cover opacity-85" />
            <div className="p-6 text-center">
              <p className="script text-4xl">Your love is the greatest gift</p>
              <p className="mt-3 text-sm leading-7 text-[#eaded1]">If you wish to honor us with a gift, our registry is available below.</p>
            </div>
          </div>
          <div className="grid gap-4">
          {links.map((link) => (
            <article key={link.id} className="section-frame p-6 text-center">
              <Gift className="text-[#b76768]" />
              <h2 className="serif mt-4 text-4xl font-semibold uppercase tracking-[0.08em]">{link.title}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6a5c55]">{link.description}</p>
              <a className="btn btn-primary mt-6" href={link.url} target="_blank" rel="noreferrer">{link.buttonText}</a>
            </article>
          ))}
          </div>
        </div>
      </section>
    </GuestPage>
  );
}
