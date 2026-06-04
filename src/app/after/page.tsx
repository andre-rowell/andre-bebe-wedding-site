import Link from "next/link";
import { Gift, Images, MessageSquareHeart } from "lucide-react";
import { GuestPage } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export default async function AfterWeddingPage() {
  const [settings, registries, photos, guestbook] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.registryLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.photo.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.guestbookEntry.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 4 }),
  ]);
  const setting = Object.fromEntries(settings.map((item) => [item.key, item.value]));
  return (
    <GuestPage>
      <section className="relative overflow-hidden bg-[#15110f] py-20 text-center text-white">
        <img src="/photos/andre-bebe-car.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-[#15110f]/60" />
        <div className="container relative max-w-4xl">
          <p className="ornament justify-center text-sm">◆</p>
          <h1 className="serif mt-5 text-6xl font-semibold uppercase tracking-[0.08em] sm:text-8xl">Thank you</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#f3e7da]">{setting.afterWeddingMessage || "Thank you for surrounding us with so much love. We are grateful for every hug, toast, dance, prayer, and memory from our wedding weekend."}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={setting.sharedAlbumUrl || "/photos"} target={setting.sharedAlbumUrl ? "_blank" : undefined} rel="noreferrer" className="btn btn-primary"><Images size={16} /> Shared album</a>
            <Link href="/guestbook" className="btn border border-white/40 text-white"><MessageSquareHeart size={16} /> Guestbook</Link>
          </div>
        </div>
      </section>
      <section className="py-10">
        <div className="container grid gap-5 lg:grid-cols-3">
          <div className="section-frame p-6 lg:col-span-2">
            <h2 className="serif text-4xl font-semibold uppercase tracking-[0.08em]">Gallery highlights</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {photos.map((photo) => <img key={photo.id} src={photo.imageUrl} alt={photo.title} loading="lazy" decoding="async" className="h-56 w-full object-cover" />)}
            </div>
            <Link href="/photos" className="btn btn-secondary mt-5">View gallery</Link>
          </div>
          <div className="section-frame p-6">
            <Gift className="text-[#9b7039]" />
            <h2 className="serif mt-4 text-4xl font-semibold">Registry links</h2>
            <div className="mt-4 grid gap-2">
              {registries.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="btn btn-secondary justify-start">{link.title}</a>)}
            </div>
          </div>
        </div>
        <div className="container mt-5 grid gap-4 md:grid-cols-4">
          {guestbook.map((entry) => (
            <article key={entry.id} className="section-frame p-5">
              <p className="script text-2xl">“{entry.message}”</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#9b7039]">{entry.name}</p>
            </article>
          ))}
        </div>
      </section>
    </GuestPage>
  );
}
