"use client";

import { ArrowDown, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function FilmHero({ dateLabel, locationLabel }: { dateLabel: string; locationLabel: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Check the preference before playback so reduced-motion visitors see the poster.
    if (!motionPreference.matches) video.play().catch(() => setIsPlaying(false));

    function onMotionChange(event: MediaQueryListEvent) {
      if (event.matches) video?.pause();
    }
    motionPreference.addEventListener("change", onMotionChange);
    return () => motionPreference.removeEventListener("change", onMotionChange);
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setIsPlaying(false));
    else video.pause();
  }

  function toggleSound() {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  }

  return (
    <section className="film-hero" aria-labelledby="film-hero-title">
      <video
        ref={videoRef}
        className="film-hero-video"
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/andre-bebe-film-poster.jpg"
        aria-label="Andre and Bebe engagement film"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={() => setIsMuted(videoRef.current?.muted ?? true)}
      >
        <source src="/media/andre-bebe-film.mp4" type="video/mp4" />
      </video>
      <div className="film-hero-copy">
        <p className="film-kicker">Together is a beautiful place to be</p>
        <h1 id="film-hero-title" className="film-title">
          <span>Andre</span>
          <span className="film-ampersand">&amp;</span>
          <span className="film-name-bebe">Bebe</span>
        </h1>
        <p className="film-date">{dateLabel}</p>
        <p className="film-location">{locationLabel}</p>
      </div>

      <a href="#invitation" className="film-scroll-cue">
        <ArrowDown size={17} aria-hidden="true" /> Our celebration
      </a>

      <div className="film-controls" role="group" aria-label="Film controls">
        <button type="button" className="film-control" onClick={togglePlayback} aria-label={isPlaying ? "Pause film" : "Play film"} title={isPlaying ? "Pause film" : "Play film"}>
          {isPlaying ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
        </button>
        <button type="button" className="film-control" onClick={toggleSound} aria-label={isMuted ? "Turn sound on" : "Mute film"} title={isMuted ? "Turn sound on" : "Mute film"}>
          {isMuted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
