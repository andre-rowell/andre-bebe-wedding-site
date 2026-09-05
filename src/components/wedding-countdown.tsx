"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function remaining(targetDate: string): TimeLeft {
  const difference = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function WeddingCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(remaining(targetDate));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  const units: Array<[keyof TimeLeft, string]> = [
    ["days", "Days"],
    ["hours", "Hours"],
    ["minutes", "Minutes"],
    ["seconds", "Seconds"],
  ];

  return (
    <div className="wedding-countdown" aria-label="Countdown to the wedding" aria-live="off">
      {units.map(([key, label]) => (
        <div key={key}>
          <strong>{timeLeft ? String(timeLeft[key]).padStart(2, "0") : "--"}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
