"use client";

import { ArrowDown, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { zolaRsvpUrl } from "@/lib/zola";

export function FilmHero({ dateLabel, locationLabel }: { dateLabel: string; locationLabel: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }

    video.play().catch(() => setIsPlaying(false));
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  return (
    <section className="film-hero" aria-labelledby="film-hero-title">
      <video
        ref={videoRef}
        className="film-hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/media/andre-bebe-film-poster.jpg"
        aria-label="Andre and Bebe engagement film"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/media/andre-bebe-film.mp4" type="video/mp4" />
      </video>
      <div className="film-hero-shade" />

      <p className="film-rail film-rail-left">{dateLabel}</p>
      <p className="film-rail film-rail-right">{locationLabel}</p>

      <div className="film-hero-copy">
        <p className="film-kicker">We&apos;re getting married</p>
        <h1 id="film-hero-title" className="film-title">
          <span>Andre</span>
          <span className="film-ampersand">&amp;</span>
          <span>Bebe</span>
        </h1>
        <p className="film-date">{dateLabel} · {locationLabel}</p>
        <a
          href={zolaRsvpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="film-rsvp-link"
          aria-label="RSVP on Zola (opens in a new tab)"
        >
          RSVP
        </a>
      </div>

      <div className="film-controls" aria-label="Film controls">
        <button type="button" className="film-control" onClick={togglePlayback} aria-label={isPlaying ? "Pause film" : "Play film"} title={isPlaying ? "Pause film" : "Play film"}>
          {isPlaying ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
        </button>
        <button type="button" className="film-control" onClick={toggleSound} aria-label={isMuted ? "Turn sound on" : "Mute film"} title={isMuted ? "Turn sound on" : "Mute film"}>
          {isMuted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
        </button>
      </div>

      <a href="#invitation" className="film-scroll-cue" aria-label="Continue to the invitation">
        <ArrowDown size={17} aria-hidden="true" />
      </a>
    </section>
  );
}
