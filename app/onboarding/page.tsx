// "use client";

// import Image from "next/image";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function OnboardingPage() {
//   const [showReview, setShowReview] = useState(false);
//   const router = useRouter();

//   return (
//     <main className="relative min-h-dvh overflow-hidden bg-(--background) px-6 py-8 text-(--foreground)">
//       <Link href="/" className="text-(--coral)">
//         ← Back to welcome
//       </Link>
//       ;{/* Same background shapes as the welcome page */}
//       <div className="pointer-events-none absolute -left-24 top-28 h-48 w-48 rounded-full bg-(--peach-light)" />
//       <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-(--teal-light)" />
//       <div className="relative mx-auto max-w-md">
//         {/* Ripple branding */}
//         <div className="flex items-center gap-3">
//           <Image src="/water-drop.png" alt="" width={36} height={48} className="h-12 w-auto object-contain" />
//           <span className="font-family-name:(--font-heading) text-2xl font-bold">Ripple</span>
//         </div>

//         <div className="mt-12">
//           <p className="text-sm font-semibold uppercase tracking-widest text-(--teal)">Your routine · Step 1 of 2</p>

//           <h1 className="mt-3 text-4xl font-bold leading-tight">Let&apos;s make Ripple yours</h1>

//           <p className="mt-4 leading-7 text-(--muted)">Tell us a little about your day. You&apos;ll be able to review and change your water goal.</p>
//         </div>

//         <form
//           //   className="mt-9 space-y-6"
//           //   onSubmit={(event) => {
//           //     event.preventDefault();
//           //     setShowReview(true);
//           //   }}
//           className="mt-9 space-y-6"
//           onSubmit={(event) => {
//             event.preventDefault();

//             const formData = new FormData(event.currentTarget);
//             const answers = Object.fromEntries(formData.entries());

//             sessionStorage.setItem("ripple-onboarding", JSON.stringify(answers));
//             router.push("/onboarding/goal");
//           }}
//         >
//           <label className="block">
//             <span className="mb-2 block font-semibold">Age range</span>
//             <select name="ageRange" required defaultValue="" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 text-(--foreground) outline-none focus:border-(--teal)">
//               <option value="" disabled>
//                 Choose your age range
//               </option>
//               <option value="18-30">18–30</option>
//               <option value="31-50">31–50</option>
//               <option value="51-65">51–65</option>
//               <option value="65+">65+</option>
//             </select>
//           </label>

//           <fieldset>
//             <legend className="mb-3 font-semibold">How active is your usual day?</legend>

//             <div className="grid gap-3">
//               {[
//                 { value: "low", label: "Mostly sitting" },
//                 { value: "moderate", label: "Some walking or movement" },
//                 { value: "high", label: "On my feet most of the day" },
//               ].map((option) => (
//                 <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-(--border) bg-white p-4 has-:checked:border-(--teal) has-:checked:bg-(--teal-light)">
//                   <input type="radio" name="activity" value={option.value} required className="accent-(--teal)" />
//                   <span>{option.label}</span>
//                 </label>
//               ))}
//             </div>
//           </fieldset>

//           <label className="block">
//             <span className="mb-1 block font-semibold">How many glasses of water do you usually drink a day?</span>
//             <span className="mb-2 block text-sm text-(--muted)">Estimate using a 250 ml glass.</span>

//             <select name="currentGlasses" required defaultValue="" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 text-(--foreground) outline-none focus:border-(--teal)">
//               <option value="" disabled>
//                 Choose an approximate number
//               </option>
//               <option value="0-2">0–2 glasses</option>
//               <option value="3-4">3–4 glasses</option>
//               <option value="5-6">5–6 glasses</option>
//               <option value="7-8">7–8 glasses</option>
//               <option value="9+">9 or more glasses</option>
//               <option value="unsure">I’m not sure</option>
//             </select>
//           </label>

//           <label className="block">
//             <span className="mb-2 block font-semibold">Exercise on a typical day</span>
//             <select name="exercise" required defaultValue="" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 text-(--foreground) outline-none focus:border-(--teal)">
//               <option value="" disabled>
//                 Choose exercise time
//               </option>
//               <option value="none">None</option>
//               <option value="under-30">Under 30 minutes</option>
//               <option value="30-60">30–60 minutes</option>
//               <option value="over-60">Over 60 minutes</option>
//             </select>
//           </label>
//           <label className="block">
//             <span className="mb-2 block font-semibold">What’s the outdoor temperature where you are today? (optional)</span>
//             <div className="relative">
//               <input type="number" name="temperatureC" min="-30" max="55" step="1" placeholder="e.g. 22" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 pr-12 text-(--foreground) outline-none focus:border-(--teal)" />
//               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted)">°C</span>
//             </div>
//             <span className="mt-2 block text-sm text-(--muted)">Enter today’s temperature, not your city’s yearly average.</span>
//           </label>

//           <div className="grid grid-cols-2 gap-4">
//             <label className="block">
//               <span className="mb-2 block font-semibold">Wake time</span>
//               <input type="time" name="wakeTime" defaultValue="08:00" required className="h-14 w-full rounded-2xl border border-(--border) bg-white px-3 outline-none focus:border-(--teal)" />
//             </label>

//             <label className="block">
//               <span className="mb-2 block font-semibold">Bedtime</span>
//               <input type="time" name="bedTime" defaultValue="22:00" required className="h-14 w-full rounded-2xl border border-(--border) bg-white px-3 outline-none focus:border-(--teal)" />
//             </label>
//           </div>

//           <label className="block">
//             <span className="mb-2 block font-semibold">
//               Life stage <span className="font-normal text-(--muted)">(optional)</span>
//             </span>
//             <select name="lifeStage" defaultValue="none" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 outline-none focus:border-(--teal)">
//               <option value="none">None of these</option>
//               <option value="pregnant">Pregnant</option>
//               <option value="breastfeeding">Breastfeeding</option>
//             </select>
//           </label>

//           <button type="submit" className="h-16 w-full rounded-2xl bg-(--foreground) text-lg font-semibold text-white hover:opacity-90">
//             Continue
//           </button>
//         </form>

//         {showReview && (
//           <div role="status" className="mt-5 rounded-2xl border border-(--border) bg-(--teal-light) p-4 text-sm text-(--foreground)">
//             Your routine is ready. Next we&apos;ll add the goal review screen.
//           </div>
//         )}

//         <p className="mt-8 pb-8 text-center text-sm text-(--muted)">You can update these answers later in Settings.</p>
//       </div>
//     </main>
//   );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const fieldClass = "h-14 w-full rounded-2xl border border-(--border) bg-white px-4 text-(--foreground) outline-none focus:border-(--teal) focus:ring-2 focus:ring-(--teal-light)";

export default function OnboardingPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    try {
      const saved = sessionStorage.getItem("ripple-onboarding");
      if (!saved) return;

      const answers = JSON.parse(saved) as Record<string, unknown>;

      for (const element of Array.from(form.elements)) {
        if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement)) {
          continue;
        }

        const value = answers[element.name];
        if (typeof value !== "string") continue;

        if (element instanceof HTMLInputElement && element.type === "radio") {
          element.checked = element.value === value;
        } else {
          element.value = value;
        }
      }
    } catch {
      // Use the default form values if the draft cannot be read.
    }
  }, []);

  return (
    <main className=" relative min-h-dvh overflow-hidden bg-(--background) text-(--foreground)">
      <div className="pointer-events-none absolute -left-24 top-28 h-48 w-48 rounded-full bg-(--peach-light)" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-(--teal-light)" />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="relative overflow-hidden rounded-3xl border border-(--border) bg-white p-6 lg:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-(--teal-light)" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/water-drop.png" alt="" width={36} height={48} className="h-10 w-auto object-contain" />
              <span className="text-2xl font-bold">Ripple</span>
            </Link>

            <Link href="/" className="text-sm font-semibold text-(--coral) hover:underline">
              ← Back to welcome
            </Link>
          </div>
        </header>

        <form
          ref={formRef}
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");

            const formData = new FormData(event.currentTarget);
            const answers = Object.fromEntries(formData.entries());

            if (answers.wakeTime === answers.bedTime) {
              setError("Choose different wake and bedtime values.");
              return;
            }

            try {
              sessionStorage.setItem("ripple-onboarding", JSON.stringify(answers));
              router.push("/onboarding/goal");
            } catch {
              setError("Could not save your routine. Please check your browser storage settings.");
            }
          }}
        >
          <section className="rounded-3xl border border-(--border) bg-white p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-(--teal)">Your routine · Step 1 of 2</p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Let&apos;s make Ripple yours</h1>

            <p className="mt-3 max-w-2xl leading-7 text-(--muted)">Tell us about your day. Next, you can review and adjust your suggested water goal.</p>
          </section>

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
            {/* DAILY HABITS */}
            <section className="space-y-6 rounded-3xl border border-(--border) bg-white p-6 sm:p-8">
              <div>
                <h2 className="text-xl font-bold">Your daily habits</h2>
                <p className="mt-1 text-sm text-(--muted)">Help us suggest a starting goal.</p>
              </div>

              <label className="block">
                <span className="mb-2 block font-semibold">Age range</span>

                <select name="ageRange" required defaultValue="" className={fieldClass}>
                  <option value="" disabled>
                    Choose your age range
                  </option>
                  <option value="18-30">18–30</option>
                  <option value="31-50">31–50</option>
                  <option value="51-65">51–65</option>
                  <option value="65+">65+</option>
                </select>
              </label>

              <fieldset>
                <legend className="mb-3 font-semibold">How active is your usual day?</legend>

                <div className="grid gap-3">
                  {[
                    { value: "low", label: "Mostly sitting" },
                    {
                      value: "moderate",
                      label: "Some walking or movement",
                    },
                    {
                      value: "high",
                      label: "On my feet most of the day",
                    },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-(--border) bg-white p-4 has-checked:border-(--teal) has-checked:bg-(--teal-light)">
                      <input type="radio" name="activity" value={option.value} required className="h-4 w-4 accent-(--teal)" />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-1 block font-semibold">How much water do you usually drink?</span>
                <span className="mb-2 block text-sm text-(--muted)">Estimate using a 250 ml glass.</span>

                <select name="currentGlasses" required defaultValue="" className={fieldClass}>
                  <option value="" disabled>
                    Choose an approximate number
                  </option>
                  <option value="0-2">0–2 glasses</option>
                  <option value="3-4">3–4 glasses</option>
                  <option value="5-6">5–6 glasses</option>
                  <option value="7-8">7–8 glasses</option>
                  <option value="9+">9 or more glasses</option>
                  <option value="unsure">I’m not sure</option>
                </select>
              </label>
            </section>

            {/* ROUTINE AND OPTIONAL DETAILS */}
            <section className="space-y-6 rounded-3xl border border-(--border) bg-white p-6 sm:p-8">
              <div>
                <h2 className="text-xl font-bold">Your routine</h2>
                <p className="mt-1 text-sm text-(--muted)">Keep reminders within your awake hours.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-semibold">☀️ Wake time</span>
                  <input type="time" name="wakeTime" defaultValue="08:00" required className={fieldClass} />
                </label>

                <label className="block">
                  <span className="mb-2 block font-semibold">🌙 Bedtime</span>
                  <input type="time" name="bedTime" defaultValue="22:00" required className={fieldClass} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block font-semibold">Exercise on a typical day</span>

                <select name="exercise" required defaultValue="" className={fieldClass}>
                  <option value="" disabled>
                    Choose exercise time
                  </option>
                  <option value="none">None</option>
                  <option value="under-30">Under 30 minutes</option>
                  <option value="30-60">30–60 minutes</option>
                  <option value="over-60">Over 60 minutes</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-semibold">
                  Outdoor temperature today <span className="text-sm font-normal text-(--muted)">(optional)</span>
                </span>

                <div className="relative">
                  <input type="number" name="temperatureC" min="-30" max="55" step="1" placeholder="e.g. 22" className={`${fieldClass} pr-12`} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted)">°C</span>
                </div>

                <span className="mt-2 block text-xs text-(--muted)">Use today’s temperature, not a yearly average.</span>
              </label>

              <label className="block">
                <span className="mb-2 block font-semibold">
                  Life stage <span className="text-sm font-normal text-(--muted)">(optional)</span>
                </span>

                <select name="lifeStage" defaultValue="none" className={fieldClass}>
                  <option value="none">None of these</option>
                  <option value="pregnant">Pregnant</option>
                  <option value="breastfeeding">Breastfeeding</option>
                </select>
              </label>
            </section>
          </div>

          <section className="rounded-3xl border border-(--border) bg-white p-6 sm:p-8">
            {error && (
              <p role="alert" className="mb-4 rounded-2xl bg-(--peach-light) p-4 text-sm">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-(--muted)">Review your suggested goal next.</p>

              <button type="submit" className="rounded-2xl bg-(--teal) px-6 py-4 font-semibold text-white transition-opacity hover:opacity-90">
                Continue to my goal →
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
