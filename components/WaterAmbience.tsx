"use client";

import Image from "next/image";
import { GlassWater } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function WaterAmbience() {
  const [playing, setPlaying] = useState(false);
  const [person, setPerson] = useState<"woman" | "man">("woman");
  const [error, setError] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const nextPersonRef = useRef<"woman" | "man">("woman");
  const requestRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      requestRef.current += 1;
      audio?.pause();
    };
  }, []);

  async function toggleSip() {
    const audio = audioRef.current;
    if (!audio) return;

    const request = ++requestRef.current;

    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      return;
    }

    setError("");
    setPerson(nextPersonRef.current);
    setPlaying(true);

    audio.volume = 0.45;
    audio.currentTime = 0;

    try {
      await audio.play();

      if (request !== requestRef.current) return;

      nextPersonRef.current = nextPersonRef.current === "woman" ? "man" : "woman";
    } catch {
      if (request !== requestRef.current) return;

      setPlaying(false);
      setError("Sound unavailable. Please try again.");
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <audio
        ref={audioRef}
        src="/audio/sip-water.wav"
        preload="none"
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setError("Could not load the sip sound.");
        }}
      />

      <button type="button" onClick={toggleSip} aria-label={playing ? "Stop sip sound" : "Take a sip"} aria-pressed={playing} title={playing ? "Stop" : "Take a sip"} className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white/55 text-[#409e9e] shadow-[0_4px_16px_rgba(64,158,158,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#409e9e]">
        {playing ? <Image src={person === "woman" ? "/women-drink.png" : "/man-drink.png"} alt="" width={44} height={44} className="h-11 w-11 object-contain" /> : <GlassWater size={25} strokeWidth={1.6} />}
      </button>

      <span className="text-[10px] leading-3 text-[#607574]">take a sip</span>

      <span role="status" className="sr-only">
        {error}
      </span>
    </div>
  );
}
