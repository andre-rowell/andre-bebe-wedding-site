import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { SectionTransitions } from "@/components/section-transitions";
import { zolaRegistryUrl, zolaRsvpUrl } from "@/lib/zola";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-wordmark" aria-label="Andre and Bebe home">
        Andre <span>&amp;</span> Bebe
      </Link>
      <nav className="site-navigation" aria-label="Primary navigation">
        <Link href="/" className="nav-home" aria-current="page">Home</Link>
        <a href={zolaRegistryUrl} target="_blank" rel="noopener noreferrer" aria-label="Registry on Zola (opens in a new tab)">
          Registry
        </a>
        <a href={zolaRsvpUrl} target="_blank" rel="noopener noreferrer" className="nav-rsvp" aria-label="RSVP on Zola (opens in a new tab)">
          RSVP
        </a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="footer-signature">Andre &amp; Bebe</p>
      <p>May 30, 2027 <span aria-hidden="true">&middot;</span> Saint Paul &amp; Minneapolis</p>
      <a href="#top">Back to top <ArrowUp size={14} aria-hidden="true" /></a>
    </footer>
  );
}

export function GuestPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div id="top" className="guest-site">
      <a href="#main" className="skip-link">Skip to content</a>
      <SiteHeader />
      <main id="main" className={`guest-flow ${className}`.trim()}>
        <SectionTransitions />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
