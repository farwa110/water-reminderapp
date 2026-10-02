"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { calculateWaterGoal, GLASS_ML, type OnboardingAnswers, type WaterGoal } from "@/lib/calculateWaterGoal";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import { useSession, useUser, UserButton } from "@clerk/nextjs";
import { greetingTime } from "@/lib/greetingTime";

import WaterDrop from "@/components/WaterDrop";
import { Sun, Moon, Sunset } from "lucide-react";

export default function GoalPage() {
  const { user } = useUser();

  const { session } = useSession();

  const [routine, setRoutine] = useState<{
    wakeTime: string;
    bedTime: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const router = useRouter();
  const [clock, setClock] = useState<Date | null>(null);

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

      // const answers = JSON.parse(saved) as OnboardingAnswers;

      const answers = JSON.parse(saved) as OnboardingAnswers & {
        wakeTime: string;
        bedTime: string;
      };

      const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;

      if (!validTime.test(answers.wakeTime) || !validTime.test(answers.bedTime) || answers.wakeTime === answers.bedTime) {
        setError("Please choose valid, different wake and bedtime values.");
        return;
      }

      setRoutine({
        wakeTime: answers.wakeTime,
        bedTime: answers.bedTime,
      });
      const result = calculateWaterGoal(answers);

      setGoal(result);
      setGlasses(result.recommendedGlasses);
    } catch {
      setError("We couldn't read your routine. Please complete it again.");
    }
  }, [router]);

  useEffect(() => {
    const tick = () => setClock(new Date());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function saveGoal() {
    if (!user || !session || glasses === null || !routine || saving) {
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const supabase = createSupabaseClient(() => session.getToken());

      const { error: databaseError } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          goal_ml: glasses * GLASS_ML,
          wake_time: routine.wakeTime,
          sleep_time: routine.bedTime,
        },
        { onConflict: "user_id" },
      );

      if (databaseError) throw databaseError;

      router.push("/dashboard");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your goal. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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
  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "there";

  const currentGreeting = clock ? greetingTime(clock) : null;
  const GreetingIcon = currentGreeting?.Icon;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-(--background) text-(--foreground)">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-72 h-64 w-64 rounded-full bg-(--peach-light)" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-(--teal-light)" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="relative overflow-hidden rounded-3xl border border-(--border) bg-white p-6 lg:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-(--teal-light)" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-(--teal)">
                {currentGreeting ? currentGreeting.text : "Welcome to Ripple"}

                {GreetingIcon ? <GreetingIcon size={18} strokeWidth={1.7} aria-hidden="true" /> : <WaterDrop width={16} height={22} className="shrink-0" />}
              </p>

              {/* <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Hi, {firstName} 💧</h2> */}
              <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold sm:text-4xl">
                Hi, {firstName}
                <WaterDrop width={26} height={36} className="shrink-0" />
              </h1>

              <div className="mt-3 text-sm">
                <DateTimeDisplay />
              </div>
            </div>

            <div className="shrink-0">
              <UserButton />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* EXPLANATION AND ROUTINE */}
          <section className="rounded-3xl border border-(--border) bg-white p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--teal-light) text-sm font-bold text-(--teal)">✓</span>
              <span className="h-px w-10 bg-(--border)" />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--teal) text-sm font-bold text-white">2</span>
              <p className="text-sm font-semibold text-(--muted)">Review your goal</p>
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-(--teal)">Your goal · Step 2 of 2</p>

            <h1 className="mt-3 max-w-lg text-4xl font-bold leading-tight sm:text-5xl">A water goal that fits your day</h1>

            <p className="mt-5 max-w-lg leading-7 text-(--muted)">A starting goal based on your routine. Adjust it to suit you.</p>

            <div className="mt-8 rounded-2xl bg-(--teal-light) p-5">
              <h3 className="font-semibold">Your daily routine</h3>

              <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="grid grid-cols-[36px_1fr] gap-x-2 gap-y-1">
                  <dt className="col-span-2 grid grid-cols-[36px_1fr] items-center gap-2 font-semibold">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--teal-light)">
                      <Sun size={24} strokeWidth={1.8} className="text-(--teal)" fill="#409e9e" fillOpacity={0.25} aria-hidden="true" />
                    </span>
                    <span>Wake time</span>
                  </dt>

                  <dd className="col-start-2 text-2xl font-bold tabular-nums">{routine?.wakeTime ?? "—"}</dd>
                </div>

                <div className="grid grid-cols-[36px_1fr] gap-x-2 gap-y-1">
                  <dt className="col-span-2 grid grid-cols-[36px_1fr] items-center gap-2 font-semibold">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--teal-light)">
                      <Moon size={24} strokeWidth={1.8} className="text-(--teal)" fill="#409e9e" fillOpacity={0.25} aria-hidden="true" />
                    </span>
                    <span>Bedtime</span>
                  </dt>

                  <dd className="col-start-2 text-2xl font-bold tabular-nums">{routine?.bedTime ?? "—"}</dd>
                </div>
              </dl>

              <p className="mt-4 text-sm leading-6 text-(--muted)">Your dashboard uses these times to keep water reminders within your awake hours.</p>
            </div>

            <div className="mt-5 rounded-2xl bg-(--peach-light) p-5">
              <h3 className="font-semibold">What happens next?</h3>
              <p className="mt-2 text-sm leading-6 text-(--muted)">Save your goal to open your dashboard. There you can log drinks, track your progress and turn on reminders.</p>
            </div>

            <Link href="/onboarding" className="mt-6 inline-block text-sm font-semibold text-(--coral) hover:underline">
              ← Edit my routine
            </Link>
          </section>

          {/* GOAL AND SAVE ACTION */}
          <section className="rounded-3xl border border-(--border) bg-white p-6 sm:p-8 lg:p-10">
            <div className="text-center">
              <span className="inline-flex rounded-full bg-(--teal-light) px-4 py-2 text-sm font-semibold text-(--teal)">Ripple suggests {goal.recommendedGlasses} glasses</span>

              <h2 className="mt-5 text-2xl font-bold">How many glasses a day?</h2>

              <p className="mt-2 text-sm text-(--muted)">One glass = {GLASS_ML} ml</p>

              <div className="mt-8">
                <div className="flex items-center justify-center gap-6 sm:gap-8">
                  <button type="button" disabled={saving || glasses <= 1} onClick={() => setGlasses((current) => Math.max(1, (current ?? 1) - 1))} aria-label="Remove one glass" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--teal-light) text-2xl font-bold text-(--teal) disabled:opacity-40 sm:h-14 sm:w-14">
                    −
                  </button>

                  <p aria-live="polite" aria-atomic="true" className="min-w-28 text-center text-8xl font-bold leading-none tabular-nums text-(--foreground) sm:min-w-40 sm:text-[120px]">
                    {glasses}
                  </p>

                  <button type="button" disabled={saving} onClick={() => setGlasses((current) => (current ?? 0) + 1)} aria-label="Add one glass" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--teal) text-2xl font-bold text-white hover:opacity-90 disabled:opacity-40 sm:h-14 sm:w-14">
                    +
                  </button>
                </div>

                <p className="mt-4 text-(--muted)">{glasses === 1 ? "glass" : "glasses"} a day</p>
              </div>

              <div className="mt-8 rounded-2xl bg-(--teal-light) px-5 py-5">
                <p className="text-sm text-(--muted)">Your daily water target</p>
                <p className="mt-1 text-3xl font-bold text-(--teal)">{totalMl.toLocaleString()} ml</p>
              </div>

              {glasses !== goal.recommendedGlasses && (
                <button type="button" disabled={saving} onClick={() => setGlasses(goal.recommendedGlasses)} className="mt-4 text-sm font-semibold text-(--teal) underline underline-offset-4 disabled:opacity-50">
                  Use suggested goal · {goal.recommendedGlasses} glasses
                </button>
              )}
            </div>

            <div className="mt-8 border-t border-(--border) pt-6">
              {saveError && (
                <p role="alert" className="mb-4 rounded-2xl bg-(--peach-light) p-4 text-sm text-(--foreground)">
                  {saveError}
                </p>
              )}

              <button type="button" onClick={() => void saveGoal()} disabled={saving || !user || !session || !routine} className="w-full rounded-2xl bg-(--teal) px-5 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? "Saving your routine…" : "Save goal & open dashboard →"}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-(--muted)">You can change your goal and routine later.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
