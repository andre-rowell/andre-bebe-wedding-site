import Link from "next/link";
import { CalendarDays, CalendarHeart, Gift, Heart, MapPin, Plane, Sparkles, Wine } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { GuestPage } from "@/components/site-shell";
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

function time24Hour(time: string) {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return "17:00";
  let hour = Number(match[1]);
  const minute = match[2] || "00";
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function ceremonyTargetIso(date: Date, startTime: string) {
  const { year, month, day } = chicagoDateParts(date);
  return `${year}-${month}-${day}T${time24Hour(startTime)}:00-05:00`;
}

export default async function Home() {
  const [settings, ceremony] = await Promise.all([
    settingsMap(),
    prisma.event.findFirst({ where: { slug: "ceremony", isActive: true } }),
  ]);
  const ceremonyDate = ceremony?.date || new Date(`${settings.weddingDate || "2027-05-30"}T22:00:00.000Z`);
  const ceremonyStartTime = ceremony?.startTime || "5:00 PM";
  const targetIso = ceremonyTargetIso(ceremonyDate, ceremonyStartTime);
  const displayDate = ceremonyDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" });
  return (
    <GuestPage>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#15110f] text-white">
        <img
          src="/photos/andre-bebe-portrait.jpg"
          alt="Andre and Bebe in formal engagement attire"
          className="hero-photo absolute inset-0 h-full w-full object-cover object-[58%_42%] opacity-72"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#15110f]/90 via-[#15110f]/48 to-[#15110f]/12" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15110f] via-transparent to-[#15110f]/30" />
        <div className="container animate-in relative flex min-h-[calc(100vh-4rem)] flex-col justify-center py-16">
          <p className="mb-4 flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#d6af78]">
            <Sparkles size={18} />
            Are getting married
          </p>
          <h1 className="serif max-w-2xl text-7xl font-semibold uppercase leading-[0.88] tracking-[0.08em] sm:text-8xl lg:text-9xl">
            Andre <span className="script block text-[#d6af78]">&</span> Bebe
          </h1>
          <div className="mt-6 grid max-w-3xl gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff4ef] sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <CalendarHeart size={20} />
              {displayDate} · {ceremonyStartTime}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={20} />
              Urban Daisy · Minneapolis, MN
            </p>
          </div>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#f4e4dc]">{settings.homepageIntro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/rsvp" className="btn btn-primary">
              RSVP
            </Link>
            <Link href="/events" className="btn border border-white/45 text-white hover:bg-white/10">
              View Events
            </Link>
          </div>
          <Countdown targetIso={targetIso} />
        </div>
      </section>
      <section className="border-b border-[#e7dbce] py-12 text-center">
        <div className="container">
          <p className="script text-3xl text-[#6e5d52]">we can&apos;t wait to celebrate with you</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6d625b]">Join us for a weekend of love, laughter, and unforgettable memories.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Events", "See the details", "/events", CalendarDays],
              ["RSVP", "Let us know", "/rsvp", Wine],
              ["Travel", "Plan your stay", "/travel", Plane],
              ["Registry", "Our wish list", "/registry", Gift],
              ["Our Story", "Get to know us", "/story", Heart],
            ].map(([title, copy, href, Icon]) => (
              <Link key={href as string} href={href as string} className="card group p-5 text-center hover:-translate-y-1">
                <Icon className="mx-auto text-[#9b7039]" size={26} />
                <h2 className="mt-4 text-[0.72rem] font-bold uppercase tracking-[0.18em]">{title as string}</h2>
                <p className="mt-2 text-xs text-[#6d625b]">{copy as string} <span className="text-[#b88948]">→</span></p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-10">
        <div className="container grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="section-frame p-6 sm:p-10">
            <p className="ornament justify-center text-sm">◆</p>
            <h2 className="serif mt-4 text-center text-4xl font-semibold uppercase tracking-[0.08em]">Our Story</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 md:items-center">
              <img src="/photos/andre-bebe-car.jpg" alt="Andre and Bebe with a classic car" loading="lazy" decoding="async" className="h-80 w-full rounded-sm object-cover object-center" />
              <div className="text-center">
                <p className="script text-4xl text-[#6e5d52]">Our Story</p>
                <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-[#6d625b]">From the first hello to forever, our journey has been a beautiful adventure.</p>
                <Link href="/story" className="btn btn-primary mt-6">Read our story</Link>
              </div>
            </div>
          </div>
          <div className="section-frame dark-panel overflow-hidden">
            <img src="/photos/andre-bebe-close.jpg" alt="Andre and Bebe close portrait" loading="lazy" decoding="async" className="h-72 w-full object-cover opacity-80" />
            <div className="p-6 text-center">
              <p className="script text-3xl">A few favorite moments</p>
              <Link href="/photos" className="btn mt-5 border border-white/35 text-white">View gallery</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="pb-10">
        <div className="container grid gap-5 lg:grid-cols-3">
          {[
            ["Travel & Stay", "Hotel blocks, getting here, shuttles, parking, and favorite local places.", "/travel", "/photos/bebe-veil-car-bw.jpg"],
            ["Registry", "Your love is the greatest gift. We have shared a few optional registry links.", "/registry", "/photos/andre-bebe-car-laugh.jpg"],
            ["FAQ", "Attire, arrival time, parking, plus-ones, kids, and other common questions.", "/faq", "/photos/andre-bebe-car-embrace.jpg"],
          ].map(([title, copy, href]) => (
            <Link key={href} href={href} className="card p-6 text-center hover:-translate-y-1">
              <h2 className="serif text-3xl font-semibold uppercase tracking-[0.08em]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#6d625b]">{copy}</p>
            </Link>
          ))}
        </div>
      </section>
    </GuestPage>
  );
}
