"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

const guideSections = [
  {
    id: "eat",
    title: "Where to eat",
    eyebrow: "Dinner, drinks, and weekend plans",
    image: "/photos/andre-bebe-car-laugh.jpg",
    imageAlt: "Andre and Bebe laughing together in a classic car",
    note: "Reservations are smart for the North Loop dinner spots, especially if you are planning a group meal.",
    items: [
      {
        category: "North Loop",
        name: "Spoon and Stable",
        copy: "A polished Minneapolis dinner spot for a reservation-worthy meal before or after the wedding weekend.",
        href: "https://www.spoonandstable.com/",
      },
      {
        category: "North Loop",
        name: "Bar La Grassa",
        copy: "Pasta, wine, and a lively room that works well for a date night or small group dinner.",
        href: "https://www.barlagrassa.com/",
      },
      {
        category: "Guthrie Theater",
        name: "Indigena by Owamni",
        copy: "A thoughtful Indigenous dining experience planned inside the Guthrie, worth checking as the weekend gets closer.",
        href: "https://owamni.com/",
      },
    ],
  },
  {
    id: "stay",
    title: "Where to stay",
    eyebrow: "Hotels with easy city access",
    image: "/photos/andre-bebe-car.jpg",
    imageAlt: "Andre and Bebe beside a classic car downtown",
    note: "Hotel block details will come later. For now, these are polished Minneapolis bases close to restaurants and weekend plans.",
    items: [
      {
        category: "North Loop",
        name: "Hewing Hotel",
        copy: "A boutique stay with warm rooms, a rooftop scene, and easy access to downtown Minneapolis.",
        href: "https://hewinghotel.com/",
      },
      {
        category: "Downtown",
        name: "Rand Tower Hotel",
        copy: "An Art Deco downtown option for guests who want a central base for the weekend.",
        href: "https://www.randtowerhotel.com/",
      },
      {
        category: "Downtown riverfront",
        name: "Four Seasons Minneapolis",
        copy: "A refined downtown stay close to restaurants, river views, and weekend exploring.",
        href: "https://www.fourseasons.com/minneapolis/",
      },
    ],
  },
  {
    id: "do",
    title: "What to do",
    eyebrow: "A few easy Minneapolis moments",
    image: "/photos/bebe-veil-car-bw.jpg",
    imageAlt: "Bebe in a veil beside a classic car",
    note: "If you are extending the trip, the riverfront and downtown arts district are easy places to spend a relaxed afternoon.",
    items: [
      {
        category: "Near Walker Art Center",
        name: "Minneapolis Sculpture Garden",
        copy: "A classic Minneapolis stop for art, photos, and an easy walk when the weather is good.",
        href: "https://www.walkerart.org/minneapolis-sculpture-garden/",
      },
      {
        category: "Riverfront",
        name: "Mill City Museum",
        copy: "A riverfront museum that tells the story of Minneapolis through the old flour mill district.",
        href: "https://www.mnhs.org/millcity",
      },
      {
        category: "Downtown East",
        name: "Guthrie Theater",
        copy: "Stop by for architecture, skyline views, or a show if you are making a longer weekend of it.",
        href: "https://www.guthrietheater.org/",
      },
    ],
  },
];

export function MinneapolisGuide() {
  const [activeId, setActiveId] = useState(guideSections[0].id);
  const [visibleId, setVisibleId] = useState(guideSections[0].id);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeout = useRef<number | null>(null);
  const activeSection = guideSections.find((section) => section.id === activeId) || guideSections[0];
  const visibleSection = guideSections.find((section) => section.id === visibleId) || guideSections[0];

  useEffect(() => {
    return () => {
      if (transitionTimeout.current) window.clearTimeout(transitionTimeout.current);
    };
  }, []);

  function selectSection(sectionId: string) {
    if (sectionId === activeId) return;

    if (transitionTimeout.current) window.clearTimeout(transitionTimeout.current);
    setActiveId(sectionId);
    setIsTransitioning(true);

    transitionTimeout.current = window.setTimeout(() => {
      setVisibleId(sectionId);
      setIsTransitioning(false);
      transitionTimeout.current = null;
    }, 170);
  }

  return (
    <section aria-labelledby="minneapolis-guide-heading" className="minneapolis-guide-section scroll-mt-24 py-12 sm:py-20">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-start">
          <h2 id="minneapolis-guide-heading" className="serif text-[3.5rem] font-light leading-[0.92] tracking-[-0.03em] text-[#211915] sm:text-7xl lg:text-8xl">
            Travel &amp; Stay
          </h2>
          <p className="max-w-2xl text-[1.02rem] leading-8 text-[#5f5149] lg:pt-4">
            If you are making a weekend of it, here are a few places to eat, stay, and explore around Minneapolis. We will keep the formal Travel page tucked away until hotel blocks and shuttle details are final.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-[0.32fr_1fr] lg:gap-14">
          <div className="grid content-start gap-8">
            <div role="tablist" aria-label="Minneapolis guide categories" className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:gap-2 sm:overflow-visible sm:pb-0">
              {guideSections.map((section) => {
                const isActive = section.id === activeSection.id;
                return (
                  <button
                    key={section.id}
                    id={`minneapolis-guide-tab-${section.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="minneapolis-guide-panel"
                    onClick={() => selectSection(section.id)}
                    className={`min-w-fit text-left text-xl font-semibold tracking-[-0.02em] transition sm:text-2xl ${
                      isActive ? "text-[#211915]" : "text-[#cdbfaf] hover:text-[#7c6252]"
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>

            <figure
              key={`${visibleSection.id}-image`}
              className={`travel-guide-photo hidden overflow-hidden rounded-[0.55rem] border border-[#d8c9b8] bg-[#e9ddd2] shadow-[0_24px_64px_rgba(68,46,32,0.13)] sm:block ${
                isTransitioning ? "is-exiting" : ""
              }`}
            >
              <img src={visibleSection.image} alt={visibleSection.imageAlt} loading="lazy" decoding="async" />
            </figure>
          </div>

          <div
            key={visibleSection.id}
            id="minneapolis-guide-panel"
            role="tabpanel"
            aria-labelledby={`minneapolis-guide-tab-${visibleSection.id}`}
            className={`travel-guide-panel ${isTransitioning ? "is-exiting" : ""}`}
          >
            <div className="grid gap-x-8 gap-y-9 md:grid-cols-3">
              {visibleSection.items.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group border-l border-[#d8c9b8] pl-5 text-[#211915]"
                >
                  <span className="fine-print block text-[#9a6932]">{item.category}</span>
                  <span className="mt-3 flex items-start justify-between gap-4">
                    <span className="text-lg font-semibold leading-tight tracking-[-0.01em]">{item.name}</span>
                    <ExternalLink className="mt-1 shrink-0 text-[#a6753d] opacity-70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" size={15} aria-hidden="true" />
                  </span>
                  <span className="mt-2 block text-[0.96rem] leading-7 text-[#62554d]">{item.copy}</span>
                </a>
              ))}
            </div>
            <p className="mt-10 max-w-2xl border-l border-[#d8c9b8] pl-5 text-[0.98rem] leading-7 text-[#6d5d53]">{visibleSection.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
