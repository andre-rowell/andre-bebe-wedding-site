import Link from "next/link";
import { CalendarHeart, Gift, Home, Menu } from "lucide-react";
import { SectionTransitions } from "@/components/section-transitions";
import { zolaRegistryUrl, zolaRsvpUrl } from "@/lib/zola";

const navigation = [
  { label: "Home", href: "/", icon: Home, opensNewTab: false },
  { label: "Registry", href: zolaRegistryUrl, icon: Gift, opensNewTab: true },
];

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-40">
      <div className="wide-container flex min-h-[3.75rem] items-center justify-between gap-3 sm:min-h-[4.25rem] sm:gap-4">
        <Link href="/" className="site-wordmark shrink-0" aria-label="Andre and Bebe home">
          Andre <span>&amp;</span> Bebe
        </Link>

        <nav className="site-primary-nav hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navigation.map(({ label, href, opensNewTab }) => (
            <Link
              key={href}
              href={href}
              className="story-link"
              target={opensNewTab ? "_blank" : undefined}
              rel={opensNewTab ? "noopener noreferrer" : undefined}
              aria-label={opensNewTab ? `${label} on Zola (opens in a new tab)` : undefined}
            >
              {label}
            </Link>
          ))}
          <Link
            href={zolaRsvpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            aria-label="RSVP on Zola (opens in a new tab)"
          >
            <CalendarHeart size={16} aria-hidden="true" />
            RSVP
          </Link>
        </nav>

        <details className="relative md:hidden">
          <summary className="btn btn-quiet h-10 w-10 list-none p-0" aria-label="Open guest navigation">
            <Menu size={18} aria-hidden="true" />
          </summary>
          <nav className="site-menu-panel absolute right-0 mt-3 grid w-[min(19rem,calc(100vw-1.5rem))] gap-1 p-3 shadow-2xl" aria-label="Mobile navigation">
            {navigation.map(({ label, href, icon: Icon, opensNewTab }) => (
              <Link
                key={href}
                href={href}
                target={opensNewTab ? "_blank" : undefined}
                rel={opensNewTab ? "noopener noreferrer" : undefined}
                className="site-menu-link flex items-center gap-3 px-3 py-3 text-sm font-semibold uppercase"
                aria-label={opensNewTab ? `${label} on Zola (opens in a new tab)` : undefined}
              >
                <Icon size={17} aria-hidden="true" /> {label}
              </Link>
            ))}
            <Link
              href={zolaRsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="site-menu-link flex items-center gap-3 px-3 py-3 text-sm font-semibold uppercase"
              aria-label="RSVP on Zola (opens in a new tab)"
            >
              <CalendarHeart size={17} aria-hidden="true" /> RSVP
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="vintage-footer editorial-footer">
      <div className="wide-container editorial-footer-grid">
        <div>
          <p className="editorial-footer-monogram" aria-hidden="true">A / B</p>
          <p className="editorial-footer-names">Andre &amp; Bebe</p>
        </div>
        <div className="footer-ledger">
          <p>May 30, 2027</p>
          <p>Hamline Church &amp; Urban Daisy</p>
          <p>Saint Paul &amp; Minneapolis, Minnesota</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link href="/">Home</Link>
          <Link href={zolaRegistryUrl} target="_blank" rel="noopener noreferrer" aria-label="Registry on Zola (opens in a new tab)">Registry</Link>
          <Link href={zolaRsvpUrl} target="_blank" rel="noopener noreferrer" aria-label="RSVP on Zola (opens in a new tab)">RSVP</Link>
        </nav>
      </div>
    </footer>
  );
}

export function GuestPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="guest-site">
      <SiteHeader />
      <main className={`guest-flow ${className}`.trim()}>
        <SectionTransitions />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
