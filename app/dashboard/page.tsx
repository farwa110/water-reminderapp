"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type WaterLog = {
  id: string;
  amount: number;
  time: string;
};

const GLASS_ML = 250;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 108;

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning ☀️";
  if (hour < 17) return "Good afternoon 🌿";
  return "Good evening 🌙";
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [remindersOn, setRemindersOn] = useState(false);

  const [goalMl, setGoalMl] = useState<number | null>(null);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [ready, setReady] = useState(false);

  /***reminders enabled */

  async function enableReminders() {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      setRemindersOn(true);
    }
  }

  useEffect(() => {
    if (!remindersOn || goalMl === null) return;

    const interval = window.setInterval(
      () => {
        const hour = new Date().getHours();
        const drankMl = logs.reduce((sum, log) => sum + log.amount, 0);

        // Remind only during daytime and while the goal is unfinished.
        if (hour >= 8 && hour < 22 && drankMl < goalMl) {
          new Notification("Time for a sip 💧", {
            body: "Take a little water break with Ripple!",
          });
        }
      },
      2 * 60 * 60 * 1000,
    );

    return () => window.clearInterval(interval);
  }, [remindersOn, goalMl, logs]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const savedGoal = localStorage.getItem(`ripple-goal-${user.id}`);
    const parsedGoal = savedGoal ? Number(savedGoal) : NaN;

    if (!Number.isFinite(parsedGoal) || parsedGoal <= 0) {
      router.replace("/onboarding");
      return;
    }

    setGoalMl(parsedGoal);

    const savedLogs = localStorage.getItem(`ripple-logs-${user.id}-${todayKey()}`);

    try {
      const parsedLogs = savedLogs ? JSON.parse(savedLogs) : [];
      setLogs(Array.isArray(parsedLogs) ? parsedLogs : []);
    } catch {
      setLogs([]);
    }

    setReady(true);
  }, [isLoaded, user, router]);

  if (!isLoaded || !ready || goalMl === null) {
    return <p className="p-8 text-(--muted)">Loading Ripple...</p>;
  }

  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "there";

  const totalMl = logs.reduce((sum, log) => sum + log.amount, 0);
  const percentage = Math.min(Math.round((totalMl / goalMl) * 100), 100);
  const remainingMl = Math.max(goalMl - totalMl, 0);
  const remainingGlasses = Math.ceil(remainingMl / GLASS_ML);

  function addWater(amount: number) {
    if (!user) return;

    const newLog: WaterLog = {
      id: crypto.randomUUID(),
      amount,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    const updatedLogs = [newLog, ...logs];

    setLogs(updatedLogs);
    localStorage.setItem(`ripple-logs-${user.id}-${todayKey()}`, JSON.stringify(updatedLogs));
  }

  return (
    <main className="min-h-dvh bg-(--background) text-(--foreground)">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-12 pt-8">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-(--muted)">{getGreeting()}</p>
            <h1 className="mt-1 text-4xl font-bold">Hi, {firstName}</h1>
          </div>

          <UserButton />
        </header>

        <section className="mt-12 text-center" aria-label="Today's water progress">
          <h2 className="text-xl font-semibold">Today’s progress</h2>

          <div className="relative mx-auto mt-6 h-64 w-64">
            <svg viewBox="0 0 256 256" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="128" cy="128" r="108" fill="none" stroke="var(--teal-light)" strokeWidth="22" />

              <circle cx="128" cy="128" r="108" fill="none" stroke="var(--teal)" strokeWidth="22" strokeLinecap="round" strokeDasharray={`${(percentage / 100) * CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`} />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <strong className="text-4xl font-bold">{totalMl.toLocaleString()} ml</strong>

              <span className="mt-2 text-(--muted)">of {goalMl.toLocaleString()} ml goal</span>
            </div>
          </div>

          <p className="mt-6 text-lg text-(--muted)">{remainingMl === 0 ? "Today’s goal reached 🎉" : `${remainingGlasses} ${remainingGlasses === 1 ? "glass" : "glasses"} to go 💧`}</p>
        </section>

        <section className="mt-9" aria-label="Add water">
          <h2 className="mb-4 text-xl font-bold">Add a drink</h2>

          <div className="grid grid-cols-3 gap-3">
            {[250, 350, 500].map((amount) => (
              <button key={amount} type="button" onClick={() => addWater(amount)} className={`h-16 rounded-2xl border text-base font-semibold ${amount === 250 ? "border-(--teal) bg-(--teal) text-white" : "border-(--border) bg-white"}`}>
                +{amount} ml
              </button>
            ))}
          </div>
          <button type="button" onClick={enableReminders} disabled={remindersOn} className="mt-4 rounded-2xl bg-(--teal-light) px-5 py-3 font-semibold">
            {remindersOn ? "Reminders enabled ✓" : "Enable reminders 🔔"}
          </button>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Today’s log</h2>

          {logs.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-white p-6 text-(--muted)">No water logged yet. Tap a button above to add your first drink.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--teal-light)">💧</span>

                  <div>
                    <p className="font-semibold">{log.amount} ml</p>
                    <p className="text-sm text-(--muted)">{log.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
