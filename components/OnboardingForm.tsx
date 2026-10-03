"use client";

import { useEffect, useRef, useState } from "react";
import type { SelectHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Sun, Moon } from "lucide-react";
import RippleSelect from "@/components/RippleSelect";
import RippleTimePicker from "@/components/RippleTimePicker";

// const fieldClass = "h-14 w-full min-w-0 rounded-2xl border border-(--border) bg-white px-4 text-base text-(--foreground) outline-none focus:border-(--teal) focus:ring-2 focus:ring-(--teal-light)";
const fieldClass = "h-14 w-full min-w-0 rounded-2xl border border-(--border) bg-white px-4 text-base text-(--foreground) outline-none transition-colors hover:border-(--teal) focus:border-(--teal) focus:ring-2 focus:ring-(--teal-light)";
const sectionClass = "min-w-0 rounded-3xl border border-(--border) bg-white p-5 sm:p-8";

function FormSelect({ children, className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${fieldClass} appearance-none pr-12 ${className}`}>
        {children}
      </select>

      <ChevronDown size={20} strokeWidth={1.8} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--teal)" />
    </div>
  );
}

export default function OnboardingForm() {
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
    <form
      ref={formRef}
      className="space-y-4 sm:space-y-6"
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
      <section className={sectionClass}>
        <p className="text-xs font-semibold uppercase tracking-widest text-(--teal)">Your routine · Step 1 of 2</p>

        <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-4xl">Let&apos;s make Ripple yours</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-(--muted) sm:text-base sm:leading-7">Tell us about your day. Next, you can review and adjust your suggested water goal.</p>
      </section>

      <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Daily habits */}
        <section className={`${sectionClass} space-y-6`}>
          <div>
            <h2 className="text-xl font-bold">Your daily habits</h2>
            <p className="mt-1 text-sm text-(--muted)">Help us suggest a starting goal.</p>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold sm:text-base">Age range</span>

            <RippleSelect
              name="ageRange"
              label="Age range"
              required
              placeholder="Choose your age range"
              options={[
                { value: "18-30", label: "18–30" },
                { value: "31-50", label: "31–50" },
                { value: "51-65", label: "51–65" },
                { value: "65+", label: "65+" },
              ]}
            />
          </div>

          <fieldset className="min-w-0">
            <legend className="mb-3 text-sm font-semibold sm:text-base">How active is your usual day?</legend>

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
                <label key={option.value} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-(--border) bg-white p-3.5 has-checked:border-(--teal) has-checked:bg-(--teal-light) sm:p-4">
                  <input type="radio" name="activity" value={option.value} required className="h-4 w-4 shrink-0 accent-(--teal)" />
                  <span className="text-sm leading-6">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <span className="mb-1 block text-sm font-semibold sm:text-base">How much water do you usually drink?</span>

            <span className="mb-2 block text-sm text-(--muted)">Estimate using a 250 ml glass.</span>

            <RippleSelect
              name="currentGlasses"
              label="How much water do you usually drink?"
              required
              placeholder="Choose an approximate number"
              options={[
                { value: "0-2", label: "0–2 glasses" },
                { value: "3-4", label: "3–4 glasses" },
                { value: "5-6", label: "5–6 glasses" },
                { value: "7-8", label: "7–8 glasses" },
                { value: "9+", label: "9 or more glasses" },
                { value: "unsure", label: "I’m not sure" },
              ]}
            />
          </div>
        </section>

        {/* Routine and optional details */}
        <section className={`${sectionClass} space-y-6`}>
          <div>
            <h2 className="text-xl font-bold">Your routine</h2>
            <p className="mt-1 text-sm text-(--muted)">Keep reminders within your awake hours.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold sm:text-base">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--teal-light)">
                  <Sun size={24} strokeWidth={1.8} className="text-(--teal)" fill="#409e9e" fillOpacity={0.25} aria-hidden="true" />
                </span>
                Wake time
              </span>

              <RippleTimePicker name="wakeTime" label="Wake time" defaultValue="08:00" />
            </div>

            <div className="min-w-0">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold sm:text-base">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--teal-light)">
                  <Moon size={24} strokeWidth={1.8} className="text-(--teal)" fill="#409e9e" fillOpacity={0.25} aria-hidden="true" />
                </span>
                Bedtime
              </span>

              <RippleTimePicker name="bedTime" label="Bedtime" defaultValue="22:00" />
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold sm:text-base">Exercise on a typical day</span>

            <RippleSelect
              name="exercise"
              label="Exercise on a typical day"
              required
              placeholder="Choose exercise time"
              options={[
                { value: "none", label: "None" },
                { value: "under-30", label: "Under 30 minutes" },
                { value: "30-60", label: "30–60 minutes" },
                { value: "over-60", label: "Over 60 minutes" },
              ]}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold sm:text-base">
              Outdoor temperature today <span className="text-sm font-normal text-(--muted)">(optional)</span>
            </span>

            <div className="relative">
              <input type="number" name="temperatureC" min="-30" max="55" step="1" placeholder="e.g. 22" className={`${fieldClass} pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--teal)">°C</span>
            </div>

            <span className="mt-2 block text-xs leading-5 text-(--muted)">Use today’s temperature, not a yearly average.</span>
          </label>

          <div>
            <span className="mb-2 block text-sm font-semibold sm:text-base">
              Life stage <span className="text-sm font-normal text-(--muted)">(optional)</span>
            </span>

            <RippleSelect
              name="lifeStage"
              label="Life stage"
              defaultValue="none"
              options={[
                { value: "none", label: "None of these" },
                { value: "pregnant", label: "Pregnant" },
                { value: "breastfeeding", label: "Breastfeeding" },
              ]}
            />
          </div>
        </section>
      </div>

      <section className={sectionClass}>
        {error && (
          <p role="alert" className="mb-4 rounded-2xl bg-(--peach-light) p-4 text-sm">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-(--muted)">Review your suggested goal next.</p>

          <button type="submit" className="min-h-14 w-full rounded-2xl bg-(--teal) px-6 py-4 font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto">
            Continue to my goal →
          </button>
        </div>
      </section>
    </form>
  );
}
