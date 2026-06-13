"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type StoryMoment = {
  year: string;
  title: string;
  copy: string;
  image: string;
};

export function StoryTimeline({ moments }: { moments: StoryMoment[] }) {
  const timelineRef = useRef<HTMLDivElement>(null);

  function moveTimeline(direction: -1 | 1) {
    const timeline = timelineRef.current;
    if (!timeline) return;

    timeline.scrollBy({
      left: direction * Math.max(280, timeline.clientWidth * 0.72),
      behavior: "smooth",
    });
  }

  return (
    <section id="story" className="editorial-band scroll-mt-24 py-12 sm:py-24">
      <div className="container">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.01em] text-[#211915] sm:text-4xl">Our winding road</h2>
          </div>
          <div className="flex gap-2" aria-label="Timeline controls">
            <button
              type="button"
              className="timeline-arrow"
              aria-label="Scroll timeline left"
              onClick={() => moveTimeline(-1)}
            >
              <ChevronLeft size={19} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="timeline-arrow"
              aria-label="Scroll timeline right"
              onClick={() => moveTimeline(1)}
            >
              <ChevronRight size={19} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div ref={timelineRef} className="winding-timeline mt-10 snap-x snap-mandatory sm:mt-14">
          <div className="winding-rail" aria-hidden="true" />
          <div className="winding-grid">
            {moments.map((moment, index) => (
              <article key={`${moment.year}-${moment.title}`} className="winding-moment animate-in snap-start" style={{ animationDelay: `${index * 70}ms` }}>
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
      </div>
    </section>
  );
}
