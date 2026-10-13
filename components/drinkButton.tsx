// "use client";

// import { useEffect, useRef, useState } from "react";
// import { GlassWater, CircleCheck } from "lucide-react";

// type Props = {
//   remainingMl: number;
//   totalMl: number;
//   goalMl: number;
//   busy: boolean;
//   onDrink: () => Promise<boolean>;
// };

// const GLASS_ML = 250;

// export default function DrinkButton({ remainingMl, totalMl, goalMl, busy, onDrink }: Props) {
//   const audioRef = useRef<AudioContext | null>(null);
//   const clickLock = useRef(false);
//   const [saving, setSaving] = useState(false);

//   const goalReached = remainingMl <= 0;
//   const pending = busy || saving;

//   useEffect(() => {
//     return () => {
//       void audioRef.current?.close();
//     };
//   }, []);

//   function playSuccessSound() {
//     const context = audioRef.current;

//     if (!context || context.state !== "running") return;

//     [660, 880].forEach((frequency, index) => {
//       const start = context.currentTime + index * 0.12;
//       const oscillator = context.createOscillator();
//       const gain = context.createGain();

//       oscillator.type = "sine";
//       oscillator.frequency.setValueAtTime(frequency, start);

//       gain.gain.setValueAtTime(0, start);
//       gain.gain.linearRampToValueAtTime(0.1, start + 0.01);
//       gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

//       oscillator.connect(gain);
//       gain.connect(context.destination);

//       oscillator.start(start);
//       oscillator.stop(start + 0.65);
//     });
//   }

//   async function handleDrink() {
//     if (clickLock.current || pending || goalReached) return;

//     clickLock.current = true;
//     setSaving(true);

//     try {
//       try {
//         const context = audioRef.current ?? new AudioContext();
//         audioRef.current = context;

//         if (context.state === "suspended") {
//           void context.resume().catch(() => {});
//         }
//       } catch {
//         // Continue saving if audio is unavailable.
//       }

//       const saved = await onDrink();

//       if (saved) {
//         try {
//           playSuccessSound();
//         } catch {
//           // The drink is already saved, even if sound fails.
//         }
//       }
//     } finally {
//       clickLock.current = false;
//       setSaving(false);
//     }
//   }

//   return (
//     <section className="min-w-0 rounded-3xl border border-(--border) bg-(--teal-light) p-5 sm:p-6 lg:p-8">
//       <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
//         {goalReached ? (
//           <>
//             <CircleCheck size={24} strokeWidth={1.5} className="h-5 w-5 shrink-0 text-(--teal) sm:h-6 sm:w-6" aria-hidden="true" />
//             <span>Well done today!</span>
//           </>
//         ) : (
//           "Just had some water?"
//         )}
//       </h2>

//       <p className="mt-2 text-sm leading-6 text-(--muted)">{goalReached ? "You’ve completed today’s water goal." : "Tap after drinking a glass to update your progress."}</p>

//       <button type="button" disabled={pending || goalReached} onClick={() => void handleDrink()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-(--teal) px-3 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5 sm:px-4 sm:py-4 sm:text-base">
//         {pending ? (
//           "Saving…"
//         ) : goalReached ? (
//           <>
//             <CircleCheck size={24} strokeWidth={1.5} className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden="true" />
//             <span>Today’s goal reached</span>
//           </>
//         ) : (
//           <>
//             <GlassWater size={24} strokeWidth={1.5} className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden="true" />

//             <span>
//               <span className="sm:hidden">Add a glass</span>
//               <span className="hidden sm:inline">I drank one glass</span>
//               <span className="whitespace-nowrap"> · {Math.min(GLASS_ML, remainingMl)} ml</span>
//             </span>
//           </>
//         )}
//       </button>

//       <p aria-live="polite" className="mt-3 text-center text-sm font-semibold text-(--teal)">
//         {Math.ceil(totalMl / GLASS_ML)} / {Math.ceil(goalMl / GLASS_ML)} glasses
//       </p>
//     </section>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { GlassWater, CircleCheck } from "lucide-react";

type Props = {
  remainingMl: number;
  totalMl: number;
  goalMl: number;
  busy: boolean;
  onDrink: () => Promise<boolean>;
};

const GLASS_ML = 250;

export default function DrinkButton({ remainingMl, totalMl, goalMl, busy, onDrink }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clickLock = useRef(false);
  const [saving, setSaving] = useState(false);

  const goalReached = remainingMl <= 0;
  const pending = busy || saving;

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function playSuccessSound() {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  async function handleDrink() {
    if (clickLock.current || pending || goalReached) return;

    clickLock.current = true;
    setSaving(true);

    try {
      try {
        const audio = audioRef.current ?? new Audio("/audio/sip-water.wav");
        audioRef.current = audio;
        audio.preload = "auto";
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
    <section className="min-w-0 rounded-3xl border border-(--border) bg-(--teal-light) p-5 sm:p-6 lg:p-8">
      <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
        {goalReached ? (
          <>
            <CircleCheck size={24} strokeWidth={1.5} className="h-5 w-5 shrink-0 text-(--teal) sm:h-6 sm:w-6" aria-hidden="true" />
            <span>Well done today!</span>
          </>
        ) : (
          "Just had some water?"
        )}
      </h2>

      <p className="mt-2 text-sm leading-6 text-(--muted)">{goalReached ? "You’ve completed today’s water goal." : "Tap after drinking a glass to update your progress."}</p>

      <button type="button" disabled={pending || goalReached} onClick={() => void handleDrink()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-(--teal) px-3 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5 sm:px-4 sm:py-4 sm:text-base">
        {pending ? (
          "Saving…"
        ) : goalReached ? (
          <>
            <CircleCheck size={24} strokeWidth={1.5} className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden="true" />
            <span>Today’s goal reached</span>
          </>
        ) : (
          <>
            <GlassWater size={24} strokeWidth={1.5} className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden="true" />

            <span>
              <span className="sm:hidden">Add a glass</span>
              <span className="hidden sm:inline">I drank one glass</span>
              <span className="whitespace-nowrap"> · {Math.min(GLASS_ML, remainingMl)} ml</span>
            </span>
          </>
        )}
      </button>

      <p aria-live="polite" className="mt-3 text-center text-sm font-semibold text-(--teal)">
        {Math.ceil(totalMl / GLASS_ML)} / {Math.ceil(goalMl / GLASS_ML)} glasses
      </p>
    </section>
  );
}
