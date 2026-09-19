import Image from "next/image";
import { ArrowUpRight, MapPin, Plus } from "lucide-react";
import { FilmHero } from "@/components/film-hero";
import { GuestPage } from "@/components/site-shell";
import { zolaRegistryUrl, zolaRsvpUrl } from "@/lib/zola";

const events = [
  {
    title: "Ceremony",
    time: "3:30 PM",
    note: null,
    venue: "Hamline Church",
    address: "1514 Englewood Ave, St. Paul, MN 55104",
    mapUrl: "https://maps.google.com/?q=Hamline+Church+1514+Englewood+Ave+St+Paul+MN+55104",
  },
  {
    title: "Cocktail Hour & Reception",
    time: "5:30 PM",
    note: "Until 11:30 PM",
    venue: "Urban Daisy",
    address: "1621 E Hennepin Ave, Minneapolis, MN 55414",
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
    <GuestPage>
      <FilmHero dateLabel="Sunday, May 30, 2027" locationLabel="Saint Paul & Minneapolis, Minnesota" />

      <section id="invitation" className="invitation-section" aria-labelledby="invitation-heading">
        <div className="content-width invitation-layout">
          <div className="invitation-copy" data-reveal>
            <p className="eyebrow">Together with their families</p>
            <h2 id="invitation-heading" className="section-title">The beginning of our <em>forever.</em></h2>
            <p className="date-note"><time dateTime="2027-05-30">May 30, 2027</time><span>Minnesota</span></p>
          </div>
          <figure id="story" className="invitation-photo" data-reveal>
            <div className="portrait">
              <Image src="/media/andre-bebe-walking-car.jpg" alt="Andre and Bebe holding hands as they walk past a black vintage car" width={1320} height={1934} sizes="(max-width: 600px) 310px, (max-width: 850px) 36vw, 360px" />
            </div>
          </figure>
        </div>
      </section>

      <section id="weekend" className="wedding-day-section" aria-labelledby="weekend-heading">
        <div className="content-width">
          <div className="section-heading" data-reveal>
            <h2 id="weekend-heading" className="section-title">The wedding <em>day.</em></h2>
          </div>
          <div className="schedule-date">
            <p>Sunday, May 30, 2027</p>
            <p>Elegant cocktail attire</p>
          </div>
          <div className="schedule">
            {events.map((event) => (
              <article key={event.title} className="event-row" data-reveal>
                <div className="event-time">{event.time}{event.note && <span>{event.note}</span>}</div>
                <div className="event-description">
                  <h3>{event.title}</h3>
                </div>
                <div className="event-venue">
                  <h4>{event.venue}</h4>
                  <address>{event.address}</address>
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                    aria-label={`Open directions to ${event.venue} in a new tab`}
                  >
                    <MapPin size={14} aria-hidden="true" /> Directions <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="registry" className="registry-section" aria-labelledby="registry-heading">
        <div className="content-width registry-layout">
          <div className="registry-photo-pair" data-reveal>
            <figure className="flowers-photo">
              <Image src="/media/calla-lilies-car.jpg" alt="White calla lilies resting on a black vintage car" width={1320} height={1977} sizes="(max-width: 600px) 163px, (max-width: 850px) 174px, 222px" />
            </figure>
            <figure className="kissing-photo">
              <Image src="/media/andre-bebe-car-portrait.jpg" alt="Andre and Bebe kissing beside a black vintage car" width={1320} height={1979} sizes="(max-width: 600px) 163px, (max-width: 850px) 174px, 222px" />
            </figure>
          </div>
          <div className="registry-copy" data-reveal>
            <p className="eyebrow">Registry</p>
            <h2 id="registry-heading" className="section-title">Your presence is<br />the greatest <em>gift.</em></h2>
            <a href={zolaRegistryUrl} target="_blank" rel="noopener noreferrer" className="wedding-button" aria-label="View our registry on Zola (opens in a new tab)">
              View our registry <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section" aria-labelledby="faq-heading">
        <div className="content-width faq-layout">
          <div data-reveal>
            <h2 id="faq-heading" className="section-title">The little<br /><em>details.</em></h2>
          </div>
          <div className="faq-list" data-reveal>
            {faqs.map((faq) => (
              <details key={faq.question} name="wedding-faq">
                <summary><span>{faq.question}</span><Plus size={16} aria-hidden="true" /></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="rsvp" className="rsvp-section" aria-labelledby="rsvp-heading">
        <div className="content-width rsvp-layout">
          <figure className="closing-photo" data-reveal>
            <Image src="/media/andre-bebe-staircase.jpg" alt="Andre and Bebe walking down a grand staircase" width={1320} height={1962} sizes="(max-width: 600px) 340px, (max-width: 850px) 45vw, 510px" />
          </figure>
          <div className="rsvp-copy" data-reveal>
            <h2 id="rsvp-heading" className="section-title">Kindly <em>reply.</em></h2>
            <a href={zolaRsvpUrl} target="_blank" rel="noopener noreferrer" className="wedding-button" aria-label="RSVP on Zola (opens in a new tab)">
              RSVP <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <p className="rsvp-deadline">Please RSVP by April 30, 2027.</p>
          </div>
        </div>
      </section>
    </GuestPage>
  );
}
