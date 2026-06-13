import Link from "next/link";
import { CalendarHeart, ChevronDown, Menu } from "lucide-react";

const primaryNav = [
  ["Our Story", "/#story"],
  ["Our Celebration", "/#celebration"],
  ["Registry", "/#registry"],
];

const secondaryNav = [
  ["Photos", "/photos"],
  ["Guestbook", "/guestbook"],
  ["Contact", "/contact"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#ded2c4]/70 bg-[#faf6ef]/92 text-[#221914] shadow-[0_10px_34px_rgba(40,31,26,0.06)] backdrop-blur-xl">
      <div className="wide-container flex min-h-[3.75rem] items-center justify-between gap-3 sm:min-h-[4.25rem] sm:gap-4">
        <Link href="/" className="serif group flex shrink-0 items-center gap-2 text-xl font-semibold tracking-[0.22em] sm:gap-3 sm:text-2xl sm:tracking-[0.28em]" aria-label="Andre and Bebe home">
          <span>A</span>
          <span className="h-7 w-px bg-[#b68a53] transition-transform group-hover:scale-y-125" />
          <span>B</span>
        </Link>

        <nav className="hidden items-center gap-7 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#443832] lg:flex" aria-label="Primary navigation">
          {primaryNav.map(([label, href]) => (
            <Link key={href} href={href} className="story-link">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <details className="relative">
            <summary className="btn btn-quiet list-none">
              More
              <ChevronDown size={15} aria-hidden="true" />
            </summary>
            <div className="absolute right-0 mt-3 grid w-52 gap-1 border border-[#ded2c4] bg-[#fffaf4] p-2 shadow-2xl">
              {secondaryNav.map(([label, href]) => (
                <Link key={href} href={href} className="px-3 py-2 text-sm font-semibold text-[#443832] hover:bg-[#f0e5d8]">
                  {label}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/rsvp" className="btn btn-primary">
            <CalendarHeart size={16} aria-hidden="true" />
            RSVP
          </Link>
        </div>

        <details className="relative lg:hidden">
          <summary className="btn btn-quiet h-10 w-10 list-none p-0" aria-label="Open guest navigation">
            <Menu size={18} aria-hidden="true" />
          </summary>
          <div className="absolute right-0 mt-3 grid w-[min(20rem,calc(100vw-1.5rem))] gap-1 border border-[#ded2c4] bg-[#fffaf4] p-3 text-[#221914] shadow-2xl">
            {[...primaryNav, ["RSVP", "/rsvp"], ...secondaryNav].map(([label, href]) => (
              <Link key={`${label}-${href}`} href={href} className="px-3 py-3 text-sm font-semibold uppercase tracking-[0.14em] hover:bg-[#f0e5d8]">
                {label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[#302722] bg-[#15110f] text-[#fffaf4]">
      <img src="/photos/bebe-veil-car-bw.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-[#15110f]/78" />
      <div className="container relative grid gap-7 py-10 text-center sm:gap-8 sm:py-16">
        <p className="script text-3xl leading-tight text-[#f3e2cf] sm:text-5xl">We can&apos;t wait to celebrate with you.</p>
        <div className="mx-auto grid max-w-3xl gap-3 text-[0.64rem] font-bold uppercase tracking-[0.17em] text-[#d9c7b4] sm:grid-cols-3 sm:gap-5 sm:text-[0.68rem] sm:tracking-[0.22em]">
          <p>May 30, 2027</p>
          <p>Urban Daisy</p>
          <p>Minneapolis, MN</p>
        </div>
        <p className="serif text-2xl tracking-[0.28em] sm:text-3xl sm:tracking-[0.34em]">A | B</p>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#d9c7b4] sm:gap-x-6 sm:text-[0.66rem] sm:tracking-[0.18em]" aria-label="Footer navigation">
          {[...primaryNav, ["RSVP", "/rsvp"]].map(([label, href]) => (
            <Link key={`${label}-${href}`} href={href} className="hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function GuestPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="guest-flow">{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHero({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <section className="editorial-band border-b border-[#ded2c4] py-12 sm:py-24">
      <div className="container animate-in max-w-5xl text-center">
        <p className="ornament justify-center text-sm">◆</p>
        <p className="eyebrow mt-5">{eyebrow}</p>
        <h1 className="editorial-title mt-4 text-balance text-[#211915]">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-[0.98rem] leading-7 text-[#5f5149] sm:mt-7 sm:text-[1.02rem] sm:leading-8">{copy}</p>
      </div>
    </section>
  );
}
