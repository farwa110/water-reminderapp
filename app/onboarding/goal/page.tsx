"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, useUser } from "@clerk/nextjs";
import { createSupabaseClient } from "@/lib/supabase";
import { calculateWaterGoal, GLASS_ML, type OnboardingAnswers, type WaterGoal } from "@/lib/calculateWaterGoal";
import GoalHeader from "@/components/GoalHeader";
import GoalRoutine from "@/components/GoalRoutine";
import GoalSelector from "@/components/GoalSelector";
import RippleLoading from "@/components/RippleLoading";

export default function GoalPage() {
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();

  const [routine, setRoutine] = useState<{
    wakeTime: string;
    bedTime: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
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
    return (
      <main className="p-6">
        <RippleLoading />
      </main>
    );
  }

  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "there";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-(--background) text-(--foreground)">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-72 h-64 w-64 rounded-full bg-(--peach-light)" />

      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-(--teal-light)" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-10">
        <GoalHeader firstName={firstName} clock={clock} />

        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="hidden lg:block">
            <GoalRoutine routine={routine} />
          </div>

          <GoalSelector recommendedGlasses={goal.recommendedGlasses} glasses={glasses} setGlasses={setGlasses} saving={saving} saveError={saveError} canSave={Boolean(user && session && routine)} onSave={saveGoal} />
        </div>
      </div>
    </main>
  );
}
