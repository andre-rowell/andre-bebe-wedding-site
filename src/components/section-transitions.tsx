"use client";

import { useEffect } from "react";

export function SectionTransitions() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".guest-flow > section"));
    if (!sections.length) return;

    let animationFrame = 0;

    const updateSectionFocus = () => {
      animationFrame = 0;
      const viewportHeight = window.innerHeight || 1;
      const focusTop = viewportHeight * 0.36;
      const focusBottom = viewportHeight * 0.66;

      sections.forEach((section, index) => {
        if (index === 0) {
          section.dataset.sectionFocus = "active";
          return;
        }

        const rect = section.getBoundingClientRect();
        const crossesFocusBand = rect.top < focusBottom && rect.bottom > focusTop;

        if (crossesFocusBand) {
          section.dataset.sectionFocus = "active";
        } else if (rect.bottom <= focusTop) {
          section.dataset.sectionFocus = "past";
        } else {
          section.dataset.sectionFocus = "future";
        }
      });
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateSectionFocus);
    };

    updateSectionFocus();
    const settleTimeout = window.setTimeout(updateSectionFocus, 100);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.clearTimeout(settleTimeout);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return null;
}
