"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { calculateWaterGoal, GLASS_ML, type OnboardingAnswers, type WaterGoal } from "@/lib/calculateWaterGoal";

export default function GoalPage() {
  const { user } = useUser();
  const router = useRouter();

  const [goal, setGoal] = useState<WaterGoal | null>(null);
  const [glasses, setGlasses] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("ripple-onboarding");

      if (!saved) {
        router.replace("/onboarding");
        return;
      }

      const answers = JSON.parse(saved) as OnboardingAnswers;
      const result = calculateWaterGoal(answers);

      setGoal(result);
      setGlasses(result.recommendedGlasses);
    } catch {
      setError("We couldn't read your routine. Please complete it again.");
    }
  }, [router]);

  if (error) {
    return (
      <main className="mx-auto max-w-md p-6">
        <p role="alert">{error}</p>
        <Link href="/onboarding" className="mt-4 block text-(--coral)">
          Back to my routine
        </Link>
      </main>
    );
  }

  if (glasses === null || goal === null) {
    return <main className="p-6">Calculating your starting goal…</main>;
  }

  const totalMl = glasses * GLASS_ML;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-(--background) px-6 py-8 text-(--foreground)">
      <div className="pointer-events-none absolute -left-24 top-28 h-48 w-48 rounded-full bg-(--peach-light)" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-(--teal-light)" />

      <div className="relative mx-auto max-w-md">
        <div className="flex items-center gap-3">
          <Image src="/water-drop.png" alt="" width={36} height={48} className="h-12 w-auto object-contain" />
          <span className="font-family-name:var(--font-heading) text-2xl font-bold">Ripple</span>
        </div>

        <p className="mt-12 text-sm font-semibold uppercase tracking-widest text-(--teal)">Your goal · Step 2 of 2</p>

        <h1 className="mt-3 text-4xl font-bold">Your suggested daily goal</h1>

        <p className="mt-4 leading-7 text-(--muted)">Based on your routine, here’s a starting goal. You can adjust it to suit you.</p>

        <div className="mt-10 rounded-3xl border border-(--border) bg-white p-8 text-center">
          <p className="font-semibold text-(--foreground)">{glasses === goal.recommendedGlasses ? "Your suggested goal" : "Your chosen goal"}</p>

          <div className="mt-6 flex items-center justify-center gap-7">
            <button type="button" onClick={() => setGlasses((current) => Math.max(1, (current ?? 1) - 1))} aria-label="Remove one glass" className="flex h-12 w-12 items-center justify-center rounded-full bg-(--teal-light) text-2xl font-bold text-(--teal)">
              −
            </button>

            <div>
              <p className="text-6xl font-bold">{glasses}</p>
              <p className="mt-1 text-(--muted)">glasses a day</p>
            </div>

            <button type="button" onClick={() => setGlasses((current) => (current ?? 0) + 1)} aria-label="Add one glass" className="flex h-12 w-12 items-center justify-center rounded-full bg-(--teal-light) text-2xl font-bold text-(--teal)">
              +
            </button>
          </div>

          <p className="mt-6 text-(--muted)">{totalMl.toLocaleString()} ml per day</p>

          {glasses !== goal.recommendedGlasses && <p className="mt-3 text-sm text-(--muted)">Ripple suggested {goal.recommendedGlasses} glasses.</p>}
        </div>

        <button
          type="button"
          onClick={() => {
            if (!user) return;

            localStorage.setItem(`ripple-goal-${user.id}`, String(totalMl));
            router.push("/dashboard");
          }}
          className="mt-9 h-16 w-full rounded-2xl bg-(--foreground) text-lg font-semibold text-white"
        >
          Save my goal
        </button>

        <Link href="/onboarding" className="mt-6 block text-center font-semibold text-(--coral)">
          Back to my routine
        </Link>
      </div>
    </main>
  );
}
