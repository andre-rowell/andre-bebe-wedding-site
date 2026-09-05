"use client";

import { useEffect } from "react";

export function SectionTransitions() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".guest-flow > section"));
    if (!sections.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => {
        section.dataset.sectionReveal = "visible";
      });
      return;
    }

    sections.forEach((section, index) => {
      section.dataset.sectionReveal = index === 0 ? "visible" : "pending";
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
        threshold: 0.08,
      },
    );

    sections.slice(1).forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
