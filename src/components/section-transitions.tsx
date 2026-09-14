"use client";

import { useEffect } from "react";

export function SectionTransitions() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".guest-flow [data-reveal]"));
    if (!sections.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => {
        section.dataset.sectionReveal = "visible";
      });
      return;
    }

    sections.forEach((section) => {
      section.dataset.sectionReveal = section.getBoundingClientRect().top < window.innerHeight ? "visible" : "pending";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const section = entry.target as HTMLElement;
          section.dataset.sectionReveal = "visible";
          observer.unobserve(section);
        }
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      sections.forEach((section) => { delete section.dataset.sectionReveal; });
    };
  }, []);

  return null;
}
