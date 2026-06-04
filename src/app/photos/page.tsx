import Link from "next/link";
import { GuestPage, PageHero } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

const photos = [
  { title: "A classic frame", caption: "A quiet moment with the car.", imageUrl: "/photos/andre-bebe-car.jpg", className: "md:col-span-2" },
  { title: "Close", caption: "The kind of portrait we will keep forever.", imageUrl: "/photos/andre-bebe-close.jpg", className: "" },
  { title: "The veil", caption: "Soft drama in black and white.", imageUrl: "/photos/bebe-veil-car-bw.jpg", className: "" },
  { title: "Golden calm", caption: "Andre and Bebe in the city.", imageUrl: "/photos/andre-bebe-portrait.jpg", className: "md:col-span-2" },
  { title: "The laugh", caption: "A favorite in-between moment.", imageUrl: "/photos/andre-bebe-car-laugh.jpg", className: "" },
  { title: "The look", caption: "Bebe, with Andre just behind.", imageUrl: "/photos/bebe-foreground.jpg", className: "" },
  { title: "Embrace", caption: "A tender favorite.", imageUrl: "/photos/andre-bebe-car-embrace.jpg", className: "" },
];

export default async function PhotosPage() {
  const sharedAlbum = await prisma.siteSetting.findUnique({ where: { key: "sharedAlbumUrl" } });
  return (
    <GuestPage>
      <PageHero eyebrow="Photos" title="A few favorite frames" copy="Engagement-season images and placeholders for the gallery we will keep growing." />
      <section className="py-10">
        <div className="container mb-5 grid gap-4 md:grid-cols-3">
          <div className="section-frame p-6 md:col-span-2">
            <h2 className="serif text-4xl font-semibold uppercase tracking-[0.08em]">Gallery</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6d625b]">Engagement favorites now, wedding weekend highlights later. The after-wedding page can point guests to a shared album as soon as it is ready.</p>
          </div>
          <div className="section-frame p-6">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9b7039]">Share memories</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/guestbook" className="btn btn-primary">Sign guestbook</Link>
              <a href={sharedAlbum?.value || "#"} target={sharedAlbum?.value ? "_blank" : undefined} rel="noreferrer" className="btn btn-secondary">Shared album</a>
            </div>
          </div>
        </div>
        <div className="container grid gap-4 md:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.imageUrl} className={`section-frame overflow-hidden ${photo.className}`}>
              <img src={photo.imageUrl} alt={photo.title} loading="lazy" decoding="async" className="h-96 w-full object-cover" />
              <figcaption className="p-4">
                <p className="serif text-2xl font-semibold uppercase tracking-[0.08em]">{photo.title}</p>
                {photo.caption ? <p className="mt-1 text-sm leading-6 text-[#6a5c55]">{photo.caption}</p> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </GuestPage>
  );
}
