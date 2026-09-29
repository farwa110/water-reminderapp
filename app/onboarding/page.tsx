"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const [showReview, setShowReview] = useState(false);
  const router = useRouter();

  return (
    <main className="relative min-h-dvh overflow-hidden bg-(--background) px-6 py-8 text-(--foreground)">
      <Link href="/" className="text-(--coral)">
        ← Back to welcome
      </Link>
      ;{/* Same background shapes as the welcome page */}
      <div className="pointer-events-none absolute -left-24 top-28 h-48 w-48 rounded-full bg-(--peach-light)" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-(--teal-light)" />
      <div className="relative mx-auto max-w-md">
        {/* Ripple branding */}
        <div className="flex items-center gap-3">
          <Image src="/water-drop.png" alt="" width={36} height={48} className="h-12 w-auto object-contain" />
          <span className="font-family-name:(--font-heading) text-2xl font-bold">Ripple</span>
        </div>

        <div className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-(--teal)">Your routine · Step 1 of 2</p>

          <h1 className="mt-3 text-4xl font-bold leading-tight">Let&apos;s make Ripple yours</h1>

          <p className="mt-4 leading-7 text-(--muted)">Tell us a little about your day. You&apos;ll be able to review and change your water goal.</p>
        </div>

        <form
          //   className="mt-9 space-y-6"
          //   onSubmit={(event) => {
          //     event.preventDefault();
          //     setShowReview(true);
          //   }}
          className="mt-9 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();

            const formData = new FormData(event.currentTarget);
            const answers = Object.fromEntries(formData.entries());

            sessionStorage.setItem("ripple-onboarding", JSON.stringify(answers));
            router.push("/onboarding/goal");
          }}
        >
          <label className="block">
            <span className="mb-2 block font-semibold">Age range</span>
            <select name="ageRange" required defaultValue="" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 text-(--foreground) outline-none focus:border-(--teal)">
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
                { value: "moderate", label: "Some walking or movement" },
                { value: "high", label: "On my feet most of the day" },
              ].map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-(--border) bg-white p-4 has-:checked:border-(--teal) has-:checked:bg-(--teal-light)">
                  <input type="radio" name="activity" value={option.value} required className="accent-(--teal)" />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1 block font-semibold">How many glasses of water do you usually drink a day?</span>
            <span className="mb-2 block text-sm text-(--muted)">Estimate using a 250 ml glass.</span>

            <select name="currentGlasses" required defaultValue="" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 text-(--foreground) outline-none focus:border-(--teal)">
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

          <label className="block">
            <span className="mb-2 block font-semibold">Exercise on a typical day</span>
            <select name="exercise" required defaultValue="" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 text-(--foreground) outline-none focus:border-(--teal)">
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
            <span className="mb-2 block font-semibold">What’s the outdoor temperature where you are today? (optional)</span>
            <div className="relative">
              <input type="number" name="temperatureC" min="-30" max="55" step="1" placeholder="e.g. 22" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 pr-12 text-(--foreground) outline-none focus:border-(--teal)" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted)">°C</span>
            </div>
            <span className="mt-2 block text-sm text-(--muted)">Enter today’s temperature, not your city’s yearly average.</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block font-semibold">Wake time</span>
              <input type="time" name="wakeTime" defaultValue="08:00" required className="h-14 w-full rounded-2xl border border-(--border) bg-white px-3 outline-none focus:border-(--teal)" />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold">Bedtime</span>
              <input type="time" name="bedTime" defaultValue="22:00" required className="h-14 w-full rounded-2xl border border-(--border) bg-white px-3 outline-none focus:border-(--teal)" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block font-semibold">
              Life stage <span className="font-normal text-(--muted)">(optional)</span>
            </span>
            <select name="lifeStage" defaultValue="none" className="h-14 w-full rounded-2xl border border-(--border) bg-white px-4 outline-none focus:border-(--teal)">
              <option value="none">None of these</option>
              <option value="pregnant">Pregnant</option>
              <option value="breastfeeding">Breastfeeding</option>
            </select>
          </label>

          <button type="submit" className="h-16 w-full rounded-2xl bg-(--foreground) text-lg font-semibold text-white hover:opacity-90">
            Continue
          </button>
        </form>

        {showReview && (
          <div role="status" className="mt-5 rounded-2xl border border-(--border) bg-(--teal-light) p-4 text-sm text-(--foreground)">
            Your routine is ready. Next we&apos;ll add the goal review screen.
          </div>
        )}

        <p className="mt-8 pb-8 text-center text-sm text-(--muted)">You can update these answers later in Settings.</p>
      </div>
    </main>
  );
}
