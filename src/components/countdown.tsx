"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownProps = {
  targetIso: string;
};

function partsUntil(targetMs: number) {
  const totalSeconds = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function Countdown({ targetIso }: CountdownProps) {
  const targetMs = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [time, setTime] = useState(() => partsUntil(targetMs));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(partsUntil(targetMs)), 1000);
    return () => window.clearInterval(timer);
  }, [targetMs]);

  const values = [
    [String(time.days), "days"],
    [pad(time.hours), "hrs"],
    [pad(time.minutes), "mins"],
    [pad(time.seconds), "secs"],
  ];

  return (
    <div className="mt-12 grid max-w-xl grid-cols-4 gap-2" aria-label="Countdown to the ceremony">
      {values.map(([value, label]) => (
        <div key={label} className="border border-white/30 bg-[#15110f]/22 p-4 text-center backdrop-blur-sm">
          <p className="serif text-4xl font-semibold tabular-nums" suppressHydrationWarning>{value}</p>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#f4e4dc]">{label}</p>
        </div>
      ))}
    </div>
  );
}
