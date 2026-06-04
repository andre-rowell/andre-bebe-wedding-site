import Link from "next/link";
import { CalendarHeart, Menu } from "lucide-react";

const nav = [
  ["Events", "/events"],
  ["RSVP", "/rsvp"],
  ["Our Story", "/story"],
  ["Travel", "/travel"],
  ["Registry", "/registry"],
  ["FAQ", "/faq"],
  ["Photos", "/photos"],
  ["Guestbook", "/guestbook"],
  ["Contact", "/contact"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#15110f]/88 text-white backdrop-blur-xl">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="serif flex items-center gap-3 text-2xl font-semibold tracking-[0.28em]">
          <span>A</span>
          <span className="h-6 w-px bg-[#b88948]" />
          <span>B</span>
        </Link>
        <nav className="hidden items-center gap-6 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f1e7dc] lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[#c99b5a]">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/rsvp" className="btn btn-primary hidden sm:inline-flex">
          <CalendarHeart size={18} />
          RSVP
        </Link>
        <details className="relative lg:hidden">
          <summary className="btn list-none border border-white/25 text-white">
            <Menu size={18} />
            Menu
          </summary>
          <div className="absolute right-0 mt-3 grid w-56 gap-2 rounded-sm border border-[#e7dbce] bg-[#fffaf5] p-3 text-[#211915] shadow-xl">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-sm px-3 py-2 text-sm font-semibold hover:bg-[#f4eadf]">
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
    <footer className="relative overflow-hidden border-t border-[#2c241f] bg-[#15110f] py-12 text-[#fffaf7]">
      <img src="/photos/bebe-veil-car-bw.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-[#15110f]/70" />
      <div className="container relative text-center">
        <p className="script text-4xl text-[#f2e5d7]">We can&apos;t wait to celebrate with you.</p>
        <p className="mt-3 text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[#d8c8b8]">May 30, 2027 · Minneapolis, Minnesota</p>
        <p className="serif mt-5 text-2xl tracking-[0.32em]">A | B</p>
      </div>
    </footer>
  );
}

export function GuestPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHero({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <section className="border-b border-[#e7dbce] py-14 sm:py-20">
      <div className="container animate-in max-w-4xl text-center">
        <p className="ornament justify-center text-sm">◆</p>
        <p className="mt-4 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#9b7039]">{eyebrow}</p>
        <h1 className="serif text-balance mt-2 text-5xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-7xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#6d625b]">{copy}</p>
      </div>
    </section>
  );
}
