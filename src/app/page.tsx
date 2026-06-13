import Link from "next/link";
import { CalendarPlus, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { GuestPage } from "@/components/site-shell";
import { googleCalendarUrl } from "@/lib/calendar";
import { formatTimeForDisplay, timeInputValue } from "@/lib/event-time";
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

function shortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(date);
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

  const storyTimeline = [
    ["2017", "The beginning", "A first conversation that made ordinary time feel a little brighter."],
    ["2019", "Life in motion", "The little rituals started to add up: dinners, playlists, family tables, and plans for what came next."],
    ["2024", "The yes", settings.proposalStory || "A quiet, intentional proposal and the easiest yes."],
    ["2027", "The celebration", "A full weekend in Minneapolis with the people who shaped us, loved us, and cheered us on."],
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
          <div className="mx-auto max-w-3xl text-center">
            <p className="ornament justify-center text-sm">◆</p>
            <p className="eyebrow mt-5">Our story</p>
            <h2 className="serif text-balance mt-3 text-5xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-7xl">The road that brought us here</h2>
            <p className="mx-auto mt-6 max-w-2xl leading-8 text-[#5f5149]">
              {settings.storyCopy || "Our story has been built in the ordinary magic: long walks, shared playlists, late dinners, family tables, and the steady decision to choose each other every day."}
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="relative">
              <div className="timeline-line absolute left-[1.15rem] top-0 hidden h-full w-px sm:block" />
              <div className="grid gap-6">
                {storyTimeline.map(([year, title, copy], index) => (
                  <article key={`${year}-${title}`} className="paper-panel animate-in grid gap-4 p-5 sm:grid-cols-[4.5rem_1fr] sm:p-6" style={{ animationDelay: `${index * 80}ms` }}>
                    <div>
                      <p className="serif text-4xl font-semibold text-[#a6753d]">{year}</p>
                    </div>
                    <div>
                      <h3 className="serif text-3xl font-semibold uppercase tracking-[0.08em]">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#5f5149]">{copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="image-frame h-80 sm:h-[30rem]">
                <img src="/photos/andre-bebe-car.jpg" alt="Andre and Bebe with a classic car" loading="lazy" decoding="async" className="object-center" />
              </div>
              <div className="grid gap-4">
                <div className="image-frame h-48 sm:h-60">
                  <img src="/photos/andre-bebe-close.jpg" alt="Andre and Bebe close portrait" loading="lazy" decoding="async" className="object-[52%_38%]" />
                </div>
                <div className="paper-panel p-6">
                  <p className="script text-4xl text-[#6d5545]">Forever starts with all of you in the room.</p>
                  <Link href="/story" className="btn btn-secondary mt-6">
                    Read more
                    <ChevronRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
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

      <section id="celebration" className="scroll-mt-24 py-16 sm:py-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">Our celebration</p>
              <h2 className="serif text-balance mt-3 text-5xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-7xl">A weekend in Minneapolis</h2>
              <p className="mt-6 leading-8 text-[#5f5149]">
                Ceremony, cocktails, dinner, dancing, and a little extra time together around the wedding weekend. Private invitation details stay protected in each household link.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/rsvp" className="btn btn-primary">RSVP today</Link>
                <Link href="/events" className="btn btn-secondary">View event page</Link>
              </div>
            </div>

            <div className="grid gap-5">
              {events.map((event, index) => (
                <article key={event.id} className="paper-panel overflow-hidden">
                  <div className="grid md:grid-cols-[13rem_1fr]">
                    <div className="grid grid-cols-[6.5rem_1fr] md:grid-cols-1">
                      <div className="flex flex-col justify-center border-r border-[#ded2c4] p-5 text-center md:border-b md:border-r-0">
                        <p className="fine-print text-[#9a6932]">{shortDate(event.date).split(",")[0]}</p>
                        <p className="serif mt-1 text-5xl font-semibold">{event.date.toLocaleDateString("en-US", { day: "2-digit", timeZone: "America/Chicago" })}</p>
                        <p className="fine-print">{event.date.toLocaleDateString("en-US", { month: "short", timeZone: "America/Chicago" })}</p>
                      </div>
                      <img src={eventImage(event.slug, index)} alt="" loading="lazy" decoding="async" className="h-40 w-full object-cover md:h-48" />
                    </div>
                    <div className="p-5 sm:p-7">
                      <p className="eyebrow">{event.type}</p>
                      <h3 className="serif mt-2 text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl">{event.title}</h3>
                      <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-[#3a302a]">
                        {formatTimeForDisplay(event.startTime)}
                        {event.endTime ? ` - ${formatTimeForDisplay(event.endTime)}` : ""}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#5f5149]">{event.description}</p>
                      <p className="mt-3 text-sm font-semibold text-[#3f342e]">{eventLocation(event)}</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className="btn btn-primary">
                          <CalendarPlus size={15} aria-hidden="true" />
                          Add to calendar
                        </a>
                        {event.mapUrl ? (
                          <a href={event.mapUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                            <MapPin size={15} aria-hidden="true" />
                            Map
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Attire", ceremony?.dressCode || "Elegant cocktail attire"],
              ["Parking", ceremony?.parkingInfo || "Parking details will be shared before wedding weekend."],
              ["Transportation", ceremony?.transportationInfo || "Shuttle details will be posted as they are confirmed."],
              ["Good to know", faqs[0]?.answer || "Please check the FAQ before reaching out with questions."],
            ].map(([title, copy]) => (
              <article key={title} className="paper-panel p-5">
                <p className="eyebrow">{title}</p>
                <p className="mt-3 text-sm leading-7 text-[#5f5149]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="travel" className="editorial-band scroll-mt-24 py-16 sm:py-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow">Travel & Stay</p>
              <h2 className="serif text-balance mt-3 text-5xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-7xl">Make a weekend of it</h2>
              <p className="mt-6 max-w-2xl leading-8 text-[#5f5149]">
                A few notes to make travel, lodging, parking, and time in Minneapolis feel easy. Admin updates to the travel page will flow into this section.
              </p>
            </div>
            <div className="image-frame h-72">
              <img src="/photos/andre-bebe-car.jpg" alt="Andre and Bebe with a classic car" loading="lazy" decoding="async" className="object-center" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {travelSections.slice(0, 4).map((section) => (
              <article key={section.id} className="paper-panel p-5">
                <p className="eyebrow">{section.category}</p>
                <h3 className="serif mt-3 text-3xl font-semibold uppercase tracking-[0.08em]">{section.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f5149]">{section.content}</p>
                {section.url ? (
                  <a href={section.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#7f542b]">
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
            <h2 className="serif text-balance mt-3 text-5xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-7xl">Let us know if you can make it</h2>
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

      <section id="registry" className="scroll-mt-24 py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="ornament justify-center text-sm">◆</p>
            <p className="eyebrow mt-5">Registry</p>
            <h2 className="serif text-balance mt-3 text-5xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-7xl">Your presence is our favorite gift</h2>
            <p className="mx-auto mt-6 max-w-2xl leading-8 text-[#5f5149]">
              If you would like to contribute further, we have included a few registry and fund options below.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {registries.map((registry) => (
              <article key={registry.id} className="paper-panel p-6 text-center">
                <h3 className="serif text-3xl font-semibold uppercase tracking-[0.08em]">{registry.title}</h3>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#5f5149]">{registry.description}</p>
                <a href={registry.url} target="_blank" rel="noreferrer" className="btn btn-primary mt-6">
                  {registry.buttonText}
                </a>
              </article>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Honeymoon", "Time away to rest, celebrate, and start marriage slowly."],
              ["At home", "Pieces that make hosting family and friends even sweeter."],
              ["With gratitude", "No gift is expected. Showing up with love is enough."],
            ].map(([title, copy]) => (
              <article key={title} className="border-t border-[#cbb89f] pt-5">
                <h3 className="serif text-3xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#5f5149]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </GuestPage>
  );
}
