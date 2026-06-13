import Link from "next/link";
import { CalendarPlus, ChevronDown, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { GuestPage } from "@/components/site-shell";
import { googleCalendarUrl } from "@/lib/calendar";
import { formatEventTimeRange, formatTimeForDisplay, hasKnownTime, timeInputValue } from "@/lib/event-time";
import { prisma } from "@/lib/prisma";

async function settingsMap() {
  const settings = await prisma.siteSetting.findMany();
  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
}

function chicagoDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return { year: value("year"), month: value("month"), day: value("day") };
}

function ceremonyTargetIso(date: Date, startTime: string) {
  const { year, month, day } = chicagoDateParts(date);
  const time = timeInputValue(startTime) || "17:00";
  return `${year}-${month}-${day}T${time}:00-05:00`;
}

function eventImage(slug: string, index: number) {
  if (slug.includes("ceremony")) return "/photos/bebe-veil-car-bw.jpg";
  if (slug.includes("reception")) return "/photos/andre-bebe-car-laugh.jpg";
  if (slug.includes("cookout")) return "/photos/andre-bebe-car-embrace.jpg";
  const images = ["/photos/andre-bebe-car.jpg", "/photos/andre-bebe-close.jpg", "/photos/bebe-foreground.jpg"];
  return images[index % images.length];
}

function eventLocation(event: { venueName: string; addressLine1: string; city: string; state: string }) {
  if (event.venueName.toUpperCase().includes("TBD") || event.addressLine1.toUpperCase().includes("TBD") || event.city.toUpperCase() === "TBD") {
    return "Location to be announced";
  }
  return `${event.venueName} / ${event.addressLine1} / ${event.city}, ${event.state}`;
}

function arrivalTimeForDisplay(startTime: string) {
  const value = timeInputValue(startTime);
  if (!value) return "TBD";
  const [hour, minute] = value.split(":").map(Number);
  const totalMinutes = (hour * 60 + minute - 30 + 24 * 60) % (24 * 60);
  const arrivalHour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const arrivalMinute = String(totalMinutes % 60).padStart(2, "0");
  return formatTimeForDisplay(`${arrivalHour}:${arrivalMinute}`).toLowerCase();
}

export default async function Home() {
  const [settings, events, registries, travelSections, faqs] = await Promise.all([
    settingsMap(),
    prisma.event.findMany({ where: { isActive: true, visibility: "PUBLIC" }, orderBy: [{ sortOrder: "asc" }, { date: "asc" }] }),
    prisma.registryLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.travelSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 8 }),
    prisma.fAQItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
  ]);

  const ceremony = events.find((event) => event.slug === "ceremony") || events[0];
  const weddingDate = ceremony?.date || new Date(`${settings.weddingDate || "2027-05-30"}T22:00:00.000Z`);
  const ceremonyStartTime = ceremony?.startTime || "5:00 PM";
  const guestArrivalTime = arrivalTimeForDisplay(ceremonyStartTime);
  const targetIso = ceremonyTargetIso(weddingDate, ceremonyStartTime);
  const displayDate = weddingDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  });
  const displayWeekday = weddingDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/Chicago",
  });
  const rsvpDeadline = settings.rsvpDeadline
    ? new Date(`${settings.rsvpDeadline}T12:00:00-05:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "April 30, 2027";

  const otherEvents = events.filter((event) => event.id !== ceremony?.id);
  const storyTimeline = [
    {
      year: "2017",
      title: "The beginning",
      copy: "A first conversation that made ordinary time feel a little brighter.",
      image: "/photos/andre-bebe-close.jpg",
    },
    {
      year: "2019",
      title: "Life in motion",
      copy: "The little rituals started to add up: dinners, playlists, family tables, and plans for what came next.",
      image: "/photos/andre-bebe-car-laugh.jpg",
    },
    {
      year: "2024",
      title: "The yes",
      copy: settings.proposalStory || "A quiet, intentional proposal and the easiest yes.",
      image: "/photos/andre-bebe-car-embrace.jpg",
    },
    {
      year: "2027",
      title: "The celebration",
      copy: "A full weekend in Minneapolis with the people who shaped us, loved us, and cheered us on.",
      image: "/photos/bebe-foreground.jpg",
    },
  ];
  const detailRows = [
    ...otherEvents.map((event) => ({
      key: event.id,
      eyebrow: event.type,
      title: event.title,
      meta: `${event.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Chicago" })} · ${formatEventTimeRange(event.startTime, event.endTime)}`,
      body: event.description,
      footer: eventLocation(event),
    })),
    {
      key: "attire",
      eyebrow: "Guest note",
      title: "Weather & attire",
      meta: "Elegant, comfortable, dance-floor ready",
      body: ceremony?.dressCode || "Elegant cocktail attire is perfect. We recommend comfortable shoes for dancing.",
      footer: "Final weather notes will be shared closer to the date.",
    },
    {
      key: "parking",
      eyebrow: "Guest note",
      title: "Location & parking",
      meta: "Urban Daisy / Minneapolis",
      body: ceremony?.parkingInfo || "Parking details will be shared before wedding weekend.",
      footer: ceremony ? eventLocation(ceremony) : "Urban Daisy / Minneapolis, MN",
    },
    {
      key: "transportation",
      eyebrow: "Guest note",
      title: "Transportation",
      meta: "Shuttle and ride-share notes",
      body: ceremony?.transportationInfo || "Shuttle details will be posted as they are confirmed.",
      footer: "Please check back before wedding weekend.",
    },
    ...faqs.slice(0, 3).map((faq) => ({
      key: faq.id,
      eyebrow: faq.category,
      title: faq.question,
      meta: "FAQ",
      body: faq.answer,
      footer: "More answers are available on the FAQ page.",
    })),
  ];

  return (
    <GuestPage>
      <section className="relative overflow-hidden bg-[#15110f] text-[#fffaf4]">
        <div className="wide-container grid min-h-[calc(100vh-4.25rem)] gap-10 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-12">
          <div className="animate-in relative z-10 order-2 pb-8 lg:order-1 lg:pb-0">
            <p className="eyebrow text-[#d6ae76]">Are getting married</p>
            <h1 className="serif mt-5 max-w-2xl text-6xl font-semibold uppercase leading-[0.86] tracking-[0.08em] text-white sm:text-8xl lg:text-[8.8rem]">
              Andre
              <span className="script block text-[#d4a86a]">&</span>
              Bebe
            </h1>
            <div className="mt-7 grid max-w-2xl gap-4 border-y border-white/18 py-5 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#ead9c6] sm:grid-cols-3">
              <p>{displayDate}</p>
              <p>{formatTimeForDisplay(ceremonyStartTime)}</p>
              <p>Minneapolis, MN</p>
            </div>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#eadfd4] sm:text-lg">
              {settings.homepageIntro || "We cannot wait to gather the people we love most for a weekend of joy, music, food, and the beginning of our marriage."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/rsvp" className="btn bg-[#fffaf4] text-[#211915] hover:bg-white">
                RSVP
              </Link>
              <Link href="#celebration" className="btn border border-white/35 text-white hover:bg-white/10">
                Our Celebration
              </Link>
            </div>
            <Countdown targetIso={targetIso} />
          </div>

          <div className="relative order-1 min-h-[34rem] lg:order-2 lg:min-h-[45rem]">
            <div className="image-frame hero-photo absolute inset-x-0 top-0 mx-auto h-[78%] w-[82%] max-w-[42rem] lg:right-0 lg:left-auto">
              <img src="/photos/andre-bebe-portrait.jpg" alt="Andre and Bebe in formal engagement attire" fetchPriority="high" className="object-[58%_36%]" />
            </div>
            <div className="float-paper paper-panel absolute bottom-0 left-0 z-10 w-[min(21rem,78vw)] p-5 text-[#211915] sm:p-6 lg:left-5">
              <p className="fine-print text-[#9a6932]">{displayWeekday}</p>
              <p className="serif mt-1 text-5xl font-semibold uppercase leading-none">May 30</p>
              <p className="mt-3 text-sm leading-6 text-[#5d5048]">Urban Daisy / Minneapolis, Minnesota</p>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(214,174,118,0.16),transparent_24rem)]" />
          </div>
        </div>
      </section>

      <section id="story" className="editorial-band scroll-mt-24 py-16 sm:py-24">
        <div className="container">
          <div className="grid gap-7 lg:grid-cols-[0.42fr_0.58fr] lg:items-end">
            <div>
              <p className="eyebrow">Our story</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.01em] text-[#211915] sm:text-4xl">Our winding road</h2>
            </div>
            <p className="max-w-3xl text-[1.02rem] leading-8 text-[#5f5149] lg:justify-self-end">
              {settings.storyCopy || "Our story has been built in the ordinary magic: long walks, shared playlists, late dinners, family tables, and the steady decision to choose each other every day."}
            </p>
          </div>

          <div className="winding-timeline mt-14">
            <div className="winding-rail" aria-hidden="true" />
            <div className="winding-grid">
              {storyTimeline.map((moment, index) => (
                <article key={`${moment.year}-${moment.title}`} className="winding-moment animate-in" style={{ animationDelay: `${index * 70}ms` }}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="flex items-center gap-3 text-sm font-bold tracking-[0.16em] text-[#a6753d]">
                      <span className="h-2 w-2 rounded-full bg-[#a6753d]" />
                      {moment.year}
                    </p>
                    <div className="flex -space-x-3 opacity-80">
                      <img src={moment.image} alt="" loading="lazy" decoding="async" className="h-10 w-10 rounded-full border border-[#fffaf4] object-cover grayscale" />
                      <img src="/photos/andre-bebe-portrait.jpg" alt="" loading="lazy" decoding="async" className="h-10 w-10 rounded-full border border-[#fffaf4] object-cover" />
                    </div>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-[-0.01em] text-[#211915]">{moment.title}</h3>
                  <p className="mt-3 text-[0.96rem] leading-7 text-[#7a6d65]">{moment.copy}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 border-t border-[#d6c8b8] pt-8">
            <p className="script max-w-3xl text-3xl leading-tight text-[#6d5545] sm:text-4xl">Forever starts with all of you in the room.</p>
            <Link href="/story" className="btn btn-secondary mt-6">
              Read more
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Engagement photos" className="bg-[#15110f] py-4">
        <div className="wide-container grid gap-4 md:grid-cols-4">
          {[
            ["/photos/bebe-veil-car-bw.jpg", "Bebe with a veil beside the classic car", "md:col-span-1"],
            ["/photos/andre-bebe-car-laugh.jpg", "Andre and Bebe laughing in the car", "md:col-span-1"],
            ["/photos/bebe-foreground.jpg", "Bebe with Andre behind her", "md:col-span-1"],
            ["/photos/andre-bebe-car-embrace.jpg", "Andre and Bebe embracing in the car", "md:col-span-1"],
          ].map(([src, alt, className]) => (
            <figure key={src} className={`image-frame h-72 ${className}`}>
              <img src={src} alt={alt} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </section>

      <section id="celebration" className="dark-editorial scroll-mt-24 overflow-hidden py-16 sm:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.88fr)] lg:items-start">
            <div className="min-w-0">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.75fr)]">
                <h2 className="serif text-5xl font-medium leading-none text-[#f0c8bd] sm:text-7xl lg:text-[6.6rem]">Our Celebration</h2>
                <p className="max-w-xl text-[1.04rem] leading-8 text-[#e1c1ba]">
                  We are getting married at Urban Daisy in Minneapolis. It is the perfect blend of warm, modern, and intimate, and we cannot wait to celebrate with great food, music, and your company.
                </p>
              </div>

              <article className="mt-16">
                <p className="text-2xl font-semibold text-[#f4c7bd] sm:text-3xl">{displayDate}</p>
                <div className="mt-8 grid max-w-2xl gap-6 border-l border-[#6e4c47] pl-6 sm:grid-cols-2">
                  <div>
                    <p className="serif text-5xl leading-none text-[#f0c8bd]">{guestArrivalTime}</p>
                    <p className="mt-3 text-[#e1c1ba]">Guests arrive</p>
                  </div>
                  <div>
                    <p className="serif text-5xl leading-none text-[#f0c8bd]">{formatTimeForDisplay(ceremonyStartTime).toLowerCase()}</p>
                    <p className="mt-3 text-[#e1c1ba]">Ceremony begins</p>
                  </div>
                </div>
                <div className="mt-9 flex max-w-3xl flex-wrap items-center gap-x-8 gap-y-3 border border-[#f0c8bd]/55 px-5 py-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#f0c8bd]">
                  <span>{ceremony?.venueName || "Urban Daisy"}</span>
                  <span className="hidden text-[#8f6d64] sm:inline">/</span>
                  <span>{ceremony?.addressLine1 || "1621 E Hennepin Ave"}</span>
                  <span className="hidden text-[#8f6d64] sm:inline">/</span>
                  <span>{ceremony ? `${ceremony.city}, ${ceremony.state}` : "Minneapolis, MN"}</span>
                </div>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="/rsvp" className="btn bg-[#f47e66] text-[#211915] hover:bg-[#ff937e]">RSVP today</Link>
                  <Link href="/events" className="btn border border-[#f0c8bd]/50 text-[#f0c8bd] hover:bg-white/5">View full event page</Link>
                </div>
              </article>

              <div className="mt-14 max-w-3xl">
                <h3 className="text-2xl font-semibold text-[#f0c8bd]">The finer details</h3>
                <div className="mt-7 divide-y divide-[#f0c8bd]/16 border-y border-[#f0c8bd]/16">
                  {detailRows.map((detail) => (
                    <details key={detail.key} className="celebration-detail group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[#f0c8bd]">
                        <span className="text-base font-semibold">{detail.title}</span>
                        <ChevronDown className="detail-icon shrink-0" size={17} aria-hidden="true" />
                      </summary>
                      <div className="pb-5">
                        <p className="fine-print text-[#d6ae76]">{detail.eyebrow} · {detail.meta}</p>
                        <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[#d9b6ae]">{detail.body}</p>
                        <p className="mt-3 text-sm font-semibold text-[#f4d8cf]">{detail.footer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-h-[34rem] lg:min-h-[48rem]">
              <div className="image-frame absolute inset-x-0 top-0 h-[72%] rounded-[1.1rem] border-[#f0c8bd]/16 shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
                <img src={ceremony ? eventImage(ceremony.slug, 0) : "/photos/bebe-veil-car-bw.jpg"} alt="Andre and Bebe wedding celebration portrait" loading="lazy" decoding="async" className="object-[50%_42%]" />
              </div>
              <div className="image-frame absolute bottom-0 right-0 h-56 w-[min(22rem,72vw)] rounded-[1.1rem] border-[#f0c8bd]/16 shadow-[0_28px_70px_rgba(0,0,0,0.38)] sm:h-64">
                <img src="/photos/andre-bebe-car-embrace.jpg" alt="Andre and Bebe in a classic car" loading="lazy" decoding="async" className="object-[52%_40%]" />
              </div>
              <div className="absolute bottom-14 left-0 hidden max-w-xs border border-[#f0c8bd]/22 bg-[#15110f]/82 p-5 backdrop-blur sm:block">
                <p className="eyebrow text-[#d6ae76]">Main event</p>
                <h3 className="serif mt-2 text-3xl text-[#fffaf4]">Ceremony</h3>
                <p className="mt-3 text-sm leading-6 text-[#e1c1ba]">{ceremony?.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ceremony && hasKnownTime(ceremony.startTime) ? (
                    <a href={googleCalendarUrl(ceremony)} target="_blank" rel="noreferrer" className="btn btn-primary">
                      <CalendarPlus size={15} aria-hidden="true" />
                      Calendar
                    </a>
                  ) : null}
                  {ceremony?.mapUrl ? (
                    <a href={ceremony.mapUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                      <MapPin size={15} aria-hidden="true" />
                      Map
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="travel" className="editorial-band scroll-mt-24 py-16 sm:py-24">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
            <div className="min-w-0">
              <p className="eyebrow">Travel & Stay</p>
              <h2 className="editorial-title-sm mt-4 text-balance">Make a weekend of it</h2>
              <p className="mt-7 max-w-2xl text-[1.02rem] leading-8 text-[#5f5149]">
                A few notes to make travel, lodging, parking, and time in Minneapolis feel easy. Admin updates to the travel page will flow into this section.
              </p>
            </div>
            <div className="image-frame h-72 min-w-0">
              <img src="/photos/andre-bebe-car.jpg" alt="Andre and Bebe with a classic car" loading="lazy" decoding="async" className="object-center" />
            </div>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {travelSections.slice(0, 4).map((section) => (
              <article key={section.id} className="ruled-card">
                <p className="eyebrow">{section.category}</p>
                <h3 className="serif mt-4 text-3xl font-semibold uppercase leading-none tracking-[0.08em]">{section.title}</h3>
                <p className="mt-4 text-[0.96rem] leading-7 text-[#5f5149]">{section.content}</p>
                {section.url ? (
                  <a href={section.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#7f542b]">
                    Open link
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
          <Link href="/travel" className="btn btn-secondary mt-8">Full travel guide</Link>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#15110f] py-16 text-[#fffaf4] sm:py-24">
        <img src="/photos/andre-bebe-close.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-28" />
        <div className="absolute inset-0 bg-[#15110f]/72" />
        <div className="container relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow text-[#d6ae76]">RSVP</p>
            <h2 className="editorial-title-sm mt-3 max-w-[36rem] text-balance text-white">Let us know if you can make it</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[#eadfd4]">
              Please RSVP and make meal selections by {rsvpDeadline}. Your invite code unlocks your household, your invited events, and each guest&apos;s response.
            </p>
            <Link href="/rsvp" className="btn mt-7 bg-[#fffaf4] text-[#211915] hover:bg-white">
              Open RSVP
            </Link>
          </div>
        </div>
      </section>

      <section id="registry" className="dark-editorial scroll-mt-24 py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <p className="ornament justify-center text-sm">◆</p>
            <p className="eyebrow mt-5">Registry</p>
            <h2 className="editorial-title mt-4 text-balance">Your presence is our favorite gift</h2>
            <p className="mx-auto mt-7 max-w-2xl text-[1.02rem] leading-8 text-[#e8d9c8]">
              If you would like to contribute further, we have included a few registry and fund options below.
            </p>
          </div>
          <div className="mx-auto mt-11 grid max-w-4xl gap-5 md:grid-cols-2">
            {registries.map((registry) => (
              <article key={registry.id} className="border border-white/15 bg-white/[0.06] p-7 text-center shadow-[0_18px_54px_rgba(0,0,0,0.22)]">
                <h3 className="serif text-3xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-4xl">{registry.title}</h3>
                <p className="mx-auto mt-5 max-w-sm text-[0.96rem] leading-7 text-[#e8d9c8]">{registry.description}</p>
                <a href={registry.url} target="_blank" rel="noreferrer" className="btn btn-primary mt-6">
                  {registry.buttonText}
                </a>
              </article>
            ))}
          </div>
          <div className="mt-11 grid gap-7 md:grid-cols-3">
            {[
              ["Honeymoon", "Time away to rest, celebrate, and start marriage slowly."],
              ["At home", "Pieces that make hosting family and friends even sweeter."],
              ["With gratitude", "No gift is expected. Showing up with love is enough."],
            ].map(([title, copy]) => (
              <article key={title} className="ruled-card">
                <h3 className="serif text-3xl font-semibold">{title}</h3>
                <p className="mt-3 text-[0.96rem] leading-7 text-[#e8d9c8]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </GuestPage>
  );
}
