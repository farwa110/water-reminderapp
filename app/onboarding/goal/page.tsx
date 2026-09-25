"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function GoalPage() {
  const { user } = useUser();
  const router = useRouter();
  const [glasses, setGlasses] = useState(8);
  const totalMl = glasses * 250;

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

        <h1 className="mt-3 text-4xl font-bold">Set your daily goal</h1>

        <p className="mt-4 leading-7 text-(--muted)">Choose a starting goal that feels right for you. You can change it any time.</p>

        <div className="mt-10 rounded-3xl border border-(--border) bg-white p-8 text-center">
          <p className="text-(--muted)">My daily goal</p>

          <div className="mt-5 flex items-center justify-center gap-7">
            <button type="button" onClick={() => setGlasses((current) => Math.max(1, current - 1))} aria-label="Remove one glass" className="flex h-12 w-12 items-center justify-center rounded-full bg-(--teal-light) text-2xl font-bold text-(--teal)">
              −
            </button>

            <div>
              <p className="text-6xl font-bold">{glasses}</p>
              <p className="mt-1 text-(--muted)">glasses</p>
            </div>

            <button type="button" onClick={() => setGlasses((current) => current + 1)} aria-label="Add one glass" className="flex h-12 w-12 items-center justify-center rounded-full bg-(--teal-light) text-2xl font-bold text-(--teal)">
              +
            </button>
          </div>

          <p className="mt-7 text-sm text-(--muted)">1 glass = 250 ml · {totalMl} ml per day</p>
        </div>

        <p className="mt-5 text-center text-sm leading-6 text-(--muted)">This is a personal tracking goal, not a medical recommendation.</p>

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

        {/* {saved && (
          <p role="status" className="mt-4 text-center text-(--teal)">
            Goal saved on this device: {glasses} glasses per day.
          </p>
        )} */}

        <Link href="/onboarding" className="mt-6 block text-center font-semibold text-(--coral)">
          Back to my routine
        </Link>
      </div>
    </main>
  );
}
