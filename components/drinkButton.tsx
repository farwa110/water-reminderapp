"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  remainingMl: number;
  totalMl: number;
  goalMl: number;
  busy: boolean;
  onDrink: () => Promise<boolean>;
};

const GLASS_ML = 250;

export default function DrinkButton({ remainingMl, totalMl, goalMl, busy, onDrink }: Props) {
  const audioRef = useRef<AudioContext | null>(null);
  const clickLock = useRef(false);
  const [saving, setSaving] = useState(false);

  const goalReached = remainingMl <= 0;
  const pending = busy || saving;

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
    };
  }, []);

  function playSuccessSound() {
    const context = audioRef.current;

    if (!context || context.state !== "running") return;

    // A soft rising “ding” after the drink is saved.
    [660, 880].forEach((frequency, index) => {
      const start = context.currentTime + index * 0.12;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.1, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.65);
    });
  }

  async function handleDrink() {
    if (clickLock.current || pending || goalReached) return;

    clickLock.current = true;
    setSaving(true);

    try {
      // Activate audio during the user's click.
      // Sound problems must not prevent saving water.
      try {
        const context = audioRef.current ?? new AudioContext();
        audioRef.current = context;

        if (context.state === "suspended") {
          void context.resume().catch(() => {});
        }
      } catch {
        // Continue saving if audio is unavailable.
      }

      const saved = await onDrink();

      if (saved) {
        try {
          playSuccessSound();
        } catch {
          // The drink is already saved, even if sound fails.
        }
      }
    } finally {
      clickLock.current = false;
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-(--border) bg-(--teal-light) p-6 lg:p-8">
      <h2 className="text-xl font-bold">{goalReached ? "Well done today! 🎉" : "Just had some water?"}</h2>

      <p className="mt-2 text-sm leading-6 text-(--muted)">{goalReached ? "You’ve completed today’s water goal." : "Tap after drinking a glass to update your progress."}</p>

      <button type="button" disabled={pending || goalReached} onClick={() => void handleDrink()} className="mt-5 w-full rounded-2xl bg-(--teal) px-4 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Saving…" : goalReached ? "Today’s goal reached 🎉" : `💧 I drank one glass · ${Math.min(GLASS_ML, remainingMl)} ml`}
      </button>

      <p aria-live="polite" className="mt-3 text-center text-sm font-semibold text-(--teal)">
        {Math.ceil(totalMl / GLASS_ML)} / {Math.ceil(goalMl / GLASS_ML)} glasses
      </p>
    </section>
  );
}
