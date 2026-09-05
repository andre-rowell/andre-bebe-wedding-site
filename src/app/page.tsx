import { ChevronDown, MapPin } from "lucide-react";
import { FilmHero } from "@/components/film-hero";
import { GuestPage } from "@/components/site-shell";
import { WeddingCountdown } from "@/components/wedding-countdown";
import { zolaRegistryUrl, zolaRsvpUrl } from "@/lib/zola";

const events = [
  {
    title: "Ceremony",
    weekday: "Sunday",
    date: "May 30",
    time: "3:30 PM",
    venue: "Hamline Church",
    address: "1514 Englewood Ave, St. Paul, MN 55104",
    description: "Please arrive early so everyone can be seated before the processional.",
    mapUrl: "https://maps.google.com/?q=Hamline+Church+1514+Englewood+Ave+St+Paul+MN+55104",
  },
  {
    title: "Cocktail Hour & Reception",
    weekday: "Sunday",
    date: "May 30",
    time: "5:30-11:30 PM",
    venue: "Urban Daisy",
    address: "1621 E Hennepin Ave, Minneapolis, MN 55414",
    description: "Cocktails, dinner, toasts, and dancing immediately following the ceremony.",
    mapUrl: "https://maps.google.com/?q=Urban+Daisy+1621+E+Hennepin+Ave+Minneapolis+MN+55414",
  },
];

const faqs = [
  {
    question: "What should I wear?",
    answer: "Elegant cocktail attire is perfect. We recommend comfortable shoes for dancing.",
  },
  {
    question: "Can I bring a plus-one?",
    answer: "Please use the RSVP link to view the named guests included with your invitation.",
  },
  {
    question: "Are children invited?",
    answer: "Children under 13 are invited only when they are specifically named on the invitation.",
  },
  {
    question: "Where should I park?",
    answer: "Parking and transportation details for both venues will be shared before the wedding weekend.",
  },
  {
    question: "What time should I arrive?",
    answer: "Please arrive at Hamline Church early enough to be seated before the 3:30 PM ceremony.",
  },
];

export default function Home() {
  return (
    <GuestPage className="cinematic-home">
      <FilmHero dateLabel="May 30, 2027" locationLabel="Saint Paul + Minneapolis, Minnesota" />

      <section id="invitation" className="cinematic-invitation" aria-labelledby="invitation-heading">
        <div className="cinematic-narrow">
          <p className="editorial-eyebrow">Together with their families</p>
          <h2 id="invitation-heading">You are invited to celebrate with us</h2>
          <p className="cinematic-lede">
            We cannot wait to gather the people we love most for a day of joy, music, food, and the beginning of our marriage.
          </p>
          <div className="invitation-ledger" aria-label="Wedding date, time, and location">
            <p><span>When</span><strong>Sunday, May 30, 2027</strong></p>
            <p><span>Time</span><strong>3:30 PM</strong></p>
            <p><span>Where</span><strong>Hamline Church</strong></p>
          </div>
          <WeddingCountdown targetDate="2027-05-30T15:30:00-05:00" />
        </div>
      </section>

      <section id="story" className="cinematic-story" aria-labelledby="story-heading">
        <div className="cinematic-wide cinematic-story-grid">
          <figure className="cinematic-portrait cinematic-portrait-primary">
            <img src="/media/andre-bebe-car-portrait.jpg" alt="Andre and Bebe kissing beside a black vintage car" loading="lazy" decoding="async" />
          </figure>
          <div className="cinematic-story-copy">
            <p className="editorial-eyebrow">Our story</p>
            <h2 id="story-heading">The best things began simply.</h2>
            <p>Our story has been built in the ordinary magic: long walks, shared playlists, late dinners, family tables, and the steady decision to choose each other every day.</p>
            <p>The proposal was intimate, intentional, and very us: a quiet moment, a beautiful view, and the easiest yes. Now we get to celebrate the next chapter with everyone who helped shape us.</p>
          </div>
        </div>
      </section>

      <section id="weekend" className="cinematic-weekend" aria-labelledby="weekend-heading">
        <div className="cinematic-wide">
          <div className="cinematic-heading-row">
            <div>
              <p className="editorial-eyebrow">Save the date</p>
              <h2 id="weekend-heading">The wedding day</h2>
            </div>
            <p>Our ceremony begins in Saint Paul, followed by dinner and dancing in Minneapolis.</p>
          </div>

          <div className="cinematic-schedule">
            {events.map((event, index) => (
              <article key={event.title} className="cinematic-event-row">
                <p className="cinematic-event-number">{String(index + 1).padStart(2, "0")}</p>
                <div className="cinematic-event-date">
                  <span>{event.weekday}</span>
                  <strong>{event.date}</strong>
                </div>
                <div className="cinematic-event-main">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
                <div className="cinematic-event-meta">
                  <strong>{event.time}</strong>
                  <span>{event.venue}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="cinematic-practical-grid">
            {events.map((event) => (
              <div key={event.venue}>
                <span>{event.title}</span>
                <strong>{event.venue}</strong>
                <p>{event.address}</p>
                <a href={event.mapUrl} target="_blank" rel="noreferrer" className="editorial-text-link" aria-label={`Open directions to ${event.venue} in a new tab`}>
                  <MapPin size={15} aria-hidden="true" /> Directions
                </a>
              </div>
            ))}
            <div>
              <span>Attire</span>
              <strong>Elegant cocktail</strong>
              <p>Polished, celebratory, and comfortable enough for the dance floor.</p>
            </div>
            <div>
              <span>Arrival</span>
              <strong>Plan ahead</strong>
              <p>Please allow time for parking and be seated before the 3:30 PM processional.</p>
            </div>
          </div>

          <div id="travel" className="cinematic-travel-callout">
            <div>
              <p className="editorial-eyebrow">Coming to the Twin Cities?</p>
              <h3>Travel, stay, and arrive with ease.</h3>
              <p>Minneapolis-Saint Paul International Airport serves the area. Hotel, parking, and transportation recommendations will be added here as plans are finalized.</p>
            </div>
            <p className="travel-note">Saint Paul ceremony<br />Minneapolis reception</p>
          </div>
        </div>
      </section>

      <section id="registry" className="cinematic-registry" aria-labelledby="registry-heading">
        <div className="cinematic-wide cinematic-registry-grid">
          <figure className="cinematic-still-life">
            <img src="/media/calla-lilies-car.jpg" alt="White calla lilies resting on a black vintage car" loading="lazy" decoding="async" />
          </figure>
          <div>
            <p className="editorial-eyebrow">Registry</p>
            <h2 id="registry-heading">Your presence is the greatest gift.</h2>
            <p>For loved ones who have asked, our Zola registry will gather our home and honeymoon wishes in one place. We are most grateful simply to celebrate with you.</p>
            <a
              href={zolaRegistryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-button"
              aria-label="View our registry on Zola (opens in a new tab)"
            >
              View our registry
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="cinematic-faq" aria-labelledby="faq-heading">
        <div className="cinematic-wide cinematic-faq-grid">
          <div className="cinematic-faq-intro">
            <p className="editorial-eyebrow">Good to know</p>
            <h2 id="faq-heading">A few answers before the day.</h2>
            <p>We will keep this page current as travel and transportation details are finalized.</p>
          </div>
          <div className="cinematic-faq-list">
            {faqs.map((faq, index) => (
              <details key={faq.question}>
                <summary>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{faq.question}</strong>
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="cinematic-rsvp" aria-labelledby="rsvp-heading">
        <div className="cinematic-wide cinematic-rsvp-grid">
          <div>
            <p className="editorial-eyebrow">Kindly reply by April 30, 2027</p>
            <h2 id="rsvp-heading">Will you be joining us?</h2>
            <p>Find your name on Zola to respond for everyone included in your party.</p>
            <a
              href={zolaRsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-button"
              aria-label="RSVP on Zola (opens in a new tab)"
            >
              RSVP on Zola
            </a>
          </div>
          <figure className="cinematic-portrait cinematic-portrait-closing">
            <img src="/media/andre-bebe-staircase.jpg" alt="Andre and Bebe walking down a grand staircase" loading="lazy" decoding="async" />
          </figure>
        </div>
      </section>
    </GuestPage>
  );
}
