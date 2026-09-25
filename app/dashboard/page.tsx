"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type WaterLog = {
  id: string;
  amount: number;
  time: string;
};

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [goalMl, setGoalMl] = useState(2000);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;

    const savedGoal = localStorage.getItem(`ripple-goal-${user.id}`);
    const savedLogs = localStorage.getItem(`ripple-logs-${user.id}-${todayKey()}`);

    if (savedGoal) setGoalMl(Number(savedGoal));
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    setReady(true);
  }, [user]);

  if (!isLoaded || !ready) {
    return <p className="p-8 text-(--muted)">Loading Ripple...</p>;
  }

  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "there";

  const totalMl = logs.reduce((sum, log) => sum + log.amount, 0);
  const percentage = Math.min(Math.round((totalMl / goalMl) * 100), 100);
  const remainingGlasses = Math.ceil(Math.max(goalMl - totalMl, 0) / 250);

  function addWater(amount: number) {
    if (!user) return;

    const newLogs = [
      {
        id: crypto.randomUUID(),
        amount,
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
      ...logs,
    ];

    setLogs(newLogs);
    localStorage.setItem(`ripple-logs-${user.id}-${todayKey()}`, JSON.stringify(newLogs));
  }

  return (
    <main className="min-h-dvh bg-(--background) text-(--foreground)">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-24 pt-8">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-(--muted)">Good afternoon</p>
            <h1 className="mt-1 text-4xl font-bold">Hi, {firstName}</h1>
          </div>
          <UserButton />
        </header>

        <section className="mt-12 text-center" aria-label="Today's progress">
          <div className="relative mx-auto h-64 w-64">
            <svg viewBox="0 0 256 256" className="-rotate-90">
              <circle cx="128" cy="128" r="108" fill="none" stroke="var(--teal-light)" strokeWidth="22" />
              <circle cx="128" cy="128" r="108" fill="none" stroke="var(--teal)" strokeWidth="22" strokeLinecap="round" strokeDasharray={`${(percentage / 100) * 678.6} 678.6`} />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <strong className="font-family-name:var(--font-heading) text-5xl">{(totalMl / 1000).toFixed(1)}L</strong>
              <span className="mt-2 text-(--muted)">of {(goalMl / 1000).toFixed(1)}L goal</span>
            </div>
          </div>

          <p className="mt-6 text-lg text-(--muted)">
            {percentage}% there — {remainingGlasses === 0 ? "goal reached! 💧" : `${remainingGlasses} glasses to go 💧`}
          </p>
        </section>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[250, 350, 500].map((amount) => (
            <button key={amount} type="button" onClick={() => addWater(amount)} className={`h-16 rounded-2xl border border-(--border) text-lg font-semibold ${amount === 500 ? "border-(--coral) bg-(--coral) text-white" : "bg-white"}`}>
              +{amount}ml
            </button>
          ))}
        </div>

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

      <nav className="fixed inset-x-0 bottom-0 border-t border-(--border) bg-(--background) py-4 text-center text-(--teal)">Home 💧</nav>
    </main>
  );
}
