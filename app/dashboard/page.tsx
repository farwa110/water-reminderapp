"use client";

import { useSession, useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import WaterReminders from "@/components/WaterReminders";
import DrinkButton from "@/components/drinkButton";
import DrinkLog from "@/components/drinkLog";
import { greetingTime } from "@/lib/greetingTime";
import WaterDrop from "@/components/WaterDrop";
import { CircleCheck } from "lucide-react";
import RippleLoading from "@/components/RippleLoading";
import GoalHeader from "@/components/GoalHeader";
type WaterLog = {
  id: string;
  amount_ml: number;
  drank_at: string;
};

type Settings = {
  goal_ml: number;
  wake_time: string;
  sleep_time: string;
  reminders_on: boolean;
  reminder_minutes: number;
};

type PlanMode = "auto" | 30 | 60 | 120;
type PlanItem = { at: number; amount: number };

const GLASS_ML = 250;
const CIRCUMFERENCE = 2 * Math.PI * 108;

function dayKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function dayBounds(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 1);
  return { start, end };
}

function errorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return "Something went wrong. Please try again.";
}

// // Supports routines that cross midnight, e.g. 16:00–02:00.
// function awakeWindow(now: Date, wakeTime: string, sleepTime: string) {
//   const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);
//   const [sleepHour, sleepMinute] = sleepTime.split(":").map(Number);

//   const wake = new Date(now);
//   wake.setHours(wakeHour, wakeMinute, 0, 0);

//   const sleep = new Date(now);
//   sleep.setHours(sleepHour, sleepMinute, 0, 0);

//   if (sleep <= wake) {
//     if (now < sleep) {
//       wake.setDate(wake.getDate() - 1);
//     } else {
//       sleep.setDate(sleep.getDate() + 1);
//     }
//   }

//   return { wake, sleep };
// }

// function makePlan(settings: Settings, remainingMl: number, mode: PlanMode): PlanItem[] {
//   if (remainingMl <= 0) return [];

//   const now = new Date();
//   const { wake, sleep } = awakeWindow(now, settings.wake_time, settings.sleep_time);

//   const start = Math.max(now.getTime(), wake.getTime());

//   // Keep the last prompt before bedtime.
//   const finish = sleep.getTime() - 60_000;
//   if (finish <= start) return [];

//   const count = Math.ceil(remainingMl / GLASS_ML);
//   const gap = mode === "auto" ? (finish - start) / count : mode * 60_000;

//   // Don't squeeze reminders into a few seconds near bedtime.
//   if (mode === "auto" && gap < 30 * 60_000) return [];

//   const plan: PlanItem[] = [];

//   for (let index = 0; index < count; index++) {
//     const at = Math.round(start + gap * (index + 1));
//     if (at > finish) break;

//     plan.push({
//       at,
//       amount: Math.min(GLASS_ML, remainingMl - index * GLASS_ML),
//     });
//   }

//   return plan;
// }

// Returns the current awake period, or the next one if it has ended.
function awakeWindow(now: Date, wakeTime: string, sleepTime: string) {
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);
  const [sleepHour, sleepMinute] = sleepTime.split(":").map(Number);

  const wake = new Date(now);
  wake.setHours(wakeHour, wakeMinute, 0, 0);

  const sleep = new Date(now);
  sleep.setHours(sleepHour, sleepMinute, 0, 0);

  // Bedtime falls on the following day.
  if (sleep <= wake) {
    sleep.setDate(sleep.getDate() + 1);

    // Before today's bedtime, we're still in yesterday's awake period.
    const previousSleep = new Date(sleep);
    previousSleep.setDate(previousSleep.getDate() - 1);

    if (now < previousSleep) {
      wake.setDate(wake.getDate() - 1);
      sleep.setDate(sleep.getDate() - 1);
    }
  }

  // This period has ended: use tomorrow's routine.
  if (now >= sleep) {
    wake.setDate(wake.getDate() + 1);
    sleep.setDate(sleep.getDate() + 1);
  }

  return { wake, sleep };
}

function makePlan(settings: Settings, remainingMl: number, mode: PlanMode): PlanItem[] {
  if (remainingMl <= 0) return [];

  const now = new Date();
  const { wake, sleep } = awakeWindow(now, settings.wake_time, settings.sleep_time);

  const start = Math.max(now.getTime(), wake.getTime());
  const finish = sleep.getTime() - 60_000;
  const availableMs = finish - start;

  if (availableMs <= 0) return [];

  const neededBreaks = Math.ceil(remainingMl / GLASS_ML);
  const minimumGap = 30 * 60_000;

  const count = Math.min(neededBreaks, Math.floor(availableMs / (mode === "auto" ? minimumGap : mode * 60_000)));

  if (count <= 0) return [];

  const gap = mode === "auto" ? availableMs / count : mode * 60_000;

  return Array.from({ length: count }, (_, index) => ({
    at: Math.min(finish, Math.round(start + gap * (index + 1))),
    amount: Math.min(GLASS_ML, remainingMl - index * GLASS_ML),
  }));
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [loadedFor, setLoadedFor] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);

  const [clock, setClock] = useState<Date | null>(null);
  const [mode, setMode] = useState<PlanMode>("auto");
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [remindersOn, setRemindersOn] = useState(false);
  const [planVersion, setPlanVersion] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const operationLock = useRef(false);
  const notificationsEnabled = useRef(false);

  const currentDay = clock ? dayKey(clock) : "";
  const loadKey = `${user?.id ?? ""}:${currentDay}`;
  const ready = loadedFor === loadKey && settings !== null;

  const totalMl = logs.reduce((sum, log) => sum + log.amount_ml, 0);
  const remainingMl = Math.max((settings?.goal_ml ?? 0) - totalMl, 0);
  const remainingGlasses = Math.ceil(remainingMl / GLASS_ML);

  useEffect(() => {
    const tick = () => setClock(new Date());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded || !user || !session || !currentDay) return;

    let cancelled = false;
    const currentUser = user;
    const currentSession = session;

    notificationsEnabled.current = false;
    setRemindersOn(false);
    setError("");

    async function loadDashboard() {
      try {
        const supabase = createSupabaseClient(() => currentSession.getToken());
        const { start, end } = dayBounds(currentDay);

        const [settingsResult, logsResult] = await Promise.all([supabase.from("user_settings").select("goal_ml, wake_time, sleep_time, reminders_on, reminder_minutes").eq("user_id", currentUser.id).maybeSingle(), supabase.from("water_logs").select("id, amount_ml, drank_at").eq("user_id", currentUser.id).gte("drank_at", start.toISOString()).lt("drank_at", end.toISOString()).order("drank_at", { ascending: false })]);

        if (cancelled) return;
        if (settingsResult.error) throw settingsResult.error;
        if (logsResult.error) throw logsResult.error;

        const saved = settingsResult.data;

        if (!saved || !Number.isFinite(saved.goal_ml) || saved.goal_ml <= 0) {
          router.replace("/onboarding");
          return;
        }

        if (!saved.wake_time || !saved.sleep_time) {
          throw new Error("Please save your wake time and bedtime through onboarding.");
        }

        setSettings(saved as Settings);
        setLogs((logsResult.data ?? []) as WaterLog[]);
        setEditingId(null);
        setLoadedFor(loadKey);

        const allowed = saved.reminders_on && "Notification" in window && Notification.permission === "granted";

        notificationsEnabled.current = Boolean(allowed);
        setRemindersOn(Boolean(allowed));
      } catch (caught) {
        if (!cancelled) setError(errorMessage(caught));
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
      notificationsEnabled.current = false;
    };
  }, [isLoaded, user, session, currentDay, loadKey, retry, router]);

  // Rebuild only when the drink total or settings change.
  // The ticking clock does not keep moving the reminder times.
  useEffect(() => {
    if (!ready || !settings) {
      setPlan([]);
      return;
    }

    setPlan(makePlan(settings, remainingMl, mode));
  }, [ready, settings, remainingMl, mode, planVersion]);

  // Display and notifications use the same schedule.
  useEffect(() => {
    const next = plan[0];

    if (!ready || !remindersOn || !next || !settings) return;

    const timer = window.setTimeout(
      () => {
        if (!notificationsEnabled.current) return;

        const now = new Date();
        const { wake, sleep } = awakeWindow(now, settings.wake_time, settings.sleep_time);

        const lateBy = now.getTime() - next.at;

        if (now >= wake && now < sleep && lateBy < 5 * 60_000 && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Time for a water break 💧", {
              body: `A gentle reminder for ${next.amount} ml. Log it after you drink.`,
              tag: `ripple-${next.at}`,
            });
          } catch {
            setError("This browser could not show the notification.");
          }
        }

        // Skip missed prompts instead of sending several at once.
        setPlan((current) => current.filter((item) => item.at > Date.now()));
      },
      Math.max(0, next.at - Date.now()),
    );

    return () => window.clearTimeout(timer);
  }, [ready, remindersOn, plan, settings]);

  async function runOperation(work: () => Promise<void>) {
    if (operationLock.current) return;

    operationLock.current = true;
    setBusy(true);
    setError("");

    try {
      await work();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      operationLock.current = false;
      setBusy(false);
    }
  }

  async function toggleReminders() {
    if (!user || !session || busy) return;

    const turnOn = !remindersOn;

    // Stop immediately, even while the preference is being saved.
    if (!turnOn) {
      notificationsEnabled.current = false;
      setRemindersOn(false);
    }

    await runOperation(async () => {
      if (turnOn) {
        if (!("Notification" in window)) {
          throw new Error("This browser does not support notifications.");
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          throw new Error("Allow notifications in your browser settings to turn reminders on.");
        }
      }

      const supabase = createSupabaseClient(() => session.getToken());
      const { data, error: saveError } = await supabase.from("user_settings").update({ reminders_on: turnOn }).eq("user_id", user.id).select("user_id").single();

      if (saveError) throw saveError;
      if (!data) throw new Error("Could not save reminder settings.");

      notificationsEnabled.current = turnOn;
      setRemindersOn(turnOn);

      if (turnOn) setPlanVersion((value) => value + 1);
    });
  }

  async function chooseMode(nextMode: PlanMode) {
    if (!user || !session || busy) return;

    await runOperation(async () => {
      if (nextMode !== "auto") {
        const supabase = createSupabaseClient(() => session.getToken());
        const { error: saveError } = await supabase.from("user_settings").update({ reminder_minutes: nextMode }).eq("user_id", user.id).select("user_id").single();

        if (saveError) throw saveError;
      }

      setMode(nextMode);
      setPlanVersion((value) => value + 1);
    });
  }

  async function addGlass(): Promise<boolean> {
    if (!user || !session || !ready || busy || operationLock.current || remainingMl <= 0) {
      return false;
    }

    let saved = false;

    await runOperation(async () => {
      const supabase = createSupabaseClient(() => session.getToken());

      const { data, error: saveError } = await supabase
        .from("water_logs")
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          amount_ml: Math.min(GLASS_ML, remainingMl),
          drank_at: new Date().toISOString(),
        })
        .select("id, amount_ml, drank_at")
        .single();

      if (saveError) throw saveError;

      if (dayKey(new Date(data.drank_at)) === currentDay) {
        setLogs((current) => [data as WaterLog, ...current]);
      }

      saved = true;
    });

    return saved;
  }

  async function deleteLog(id: string) {
    if (!user || !session) return;

    await runOperation(async () => {
      const supabase = createSupabaseClient(() => session.getToken());
      const { error: deleteError } = await supabase.from("water_logs").delete().eq("id", id).eq("user_id", user.id).select("id").single();

      if (deleteError) throw deleteError;
      setLogs((current) => current.filter((log) => log.id !== id));
      if (editingId === id) setEditingId(null);
    });
  }

  async function saveEdit(id: string) {
    if (!user || !session) return;

    const amount = Number(editAmount);

    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Enter a whole number greater than zero.");
      return;
    }

    await runOperation(async () => {
      const supabase = createSupabaseClient(() => session.getToken());
      const { data, error: saveError } = await supabase.from("water_logs").update({ amount_ml: amount }).eq("id", id).eq("user_id", user.id).select("id, amount_ml, drank_at").single();

      if (saveError) throw saveError;

      setLogs((current) => current.map((log) => (log.id === id ? (data as WaterLog) : log)));
      setEditingId(null);
    });
  }

  async function resetToday() {
    if (!user || !session || busy) return;
    if (!window.confirm("Delete all drinks logged today?")) return;

    await runOperation(async () => {
      const { start, end } = dayBounds(currentDay);
      const supabase = createSupabaseClient(() => session.getToken());

      const { error: deleteError } = await supabase.from("water_logs").delete().eq("user_id", user.id).gte("drank_at", start.toISOString()).lt("drank_at", end.toISOString());

      if (deleteError) throw deleteError;

      setLogs([]);
      setEditingId(null);
      setPlanVersion((value) => value + 1);
    });
  }

  if (isLoaded && !user) {
    return (
      <main className="p-8">
        <Link href="/sign-in">Sign in to view your dashboard</Link>
      </main>
    );
  }

  if (!ready || !settings || !clock) {
    return (
      <main className="p-8 text-(--foreground)">
        <RippleLoading />
      </main>
    );
  }

  const percentage = Math.min((totalMl / settings.goal_ml) * 100, 100);
  const firstName = user?.firstName ?? "there";
  const plannedMl = plan.reduce((sum, item) => sum + item.amount, 0);
  const nextReminder = plan[0];

  const currentGreeting = clock ? greetingTime(clock) : null;
  const GreetingIcon = currentGreeting?.Icon;

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-(--background) text-(--foreground)">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-28 z-0 h-48 w-48 rounded-full bg-(--peach-light)" />

      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 z-0 h-80 w-80 rounded-full bg-(--teal-light)" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <GoalHeader firstName={firstName} clock={clock} />

        {error && (
          <p role="alert" className="rounded-2xl border border-(--coral) bg-(--peach-light) p-4 text-sm">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* LEFT COLUMN */}

          <div className="flex min-w-0 flex-col gap-6">
            {/* <section className="rounded-3xl border border-(--border) bg-white p-6 text-center lg:p-10"> */}
            <section className="flex flex-col items-center justify-center rounded-3xl border border-(--border) bg-white p-6 text-center lg:flex-1 lg:p-10">
              <h2 className="text-2xl font-bold">Today’s progress</h2>

              <p className="mt-2 text-sm text-(--muted)">Water you have actually drunk</p>

              <div className="relative mx-auto mt-6 h-60 w-60 sm:h-72 sm:w-72 lg:h-80 lg:w-80">
                <svg viewBox="0 0 256 256" className="h-full w-full -rotate-90" aria-hidden="true">
                  <circle cx="128" cy="128" r="108" fill="none" stroke="var(--teal-light)" strokeWidth="20" />

                  {percentage > 0 && <circle cx="128" cy="128" r="108" fill="none" stroke="var(--teal)" strokeWidth="20" strokeLinecap="round" strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`} strokeDashoffset={CIRCUMFERENCE * (1 - percentage / 100)} className="transition-all duration-500" />}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <strong className="text-4xl font-bold sm:text-5xl">{totalMl.toLocaleString()}</strong>

                  <span className="mt-1 font-semibold text-(--teal)">ml logged</span>

                  <span className="mt-3 text-sm text-(--muted)">of {settings.goal_ml.toLocaleString()} ml goal</span>
                </div>
              </div>

              {/* <p className="mt-5 text-lg font-semibold text-(--teal)">{remainingMl === 0 ? "Today’s goal reached 🎉" : `${remainingMl.toLocaleString()} ml left`}</p> */}

              <p className="mt-5 flex items-center gap-2 text-lg font-semibold text-(--teal)">
                {remainingMl === 0 ? (
                  <>
                    <CircleCheck size={22} strokeWidth={1.5} aria-hidden="true" />
                    <span>Today’s goal reached</span>
                  </>
                ) : (
                  `${remainingMl.toLocaleString()} ml left`
                )}
              </p>
              {remainingMl > 0 && (
                <p className="mt-1 text-sm text-(--muted)">
                  About {remainingGlasses} more {remainingGlasses === 1 ? "glass" : "glasses"} of 250 ml
                </p>
              )}

              <Link href="/onboarding" className="mt-5 inline-block text-sm text-(--muted) underline underline-offset-4">
                Change my goal or routine
              </Link>
            </section>

            <DrinkButton remainingMl={remainingMl} totalMl={totalMl} goalMl={settings.goal_ml} busy={busy} onDrink={addGlass} />
          </div>

          {/* RIGHT COLUMN */}
          {/* <WaterReminders key={loadKey} plan={plan} mode={mode} remainingMl={remainingMl} wakeTime={settings.wake_time} sleepTime={settings.sleep_time} busy={busy} onChooseMode={chooseMode} /> */}
          <WaterReminders key={loadKey} plan={plan} mode={mode} remainingMl={remainingMl} wakeTime={settings.wake_time} sleepTime={settings.sleep_time} busy={busy} onChooseMode={chooseMode} onRemindersEnabled={() => setPlanVersion((value) => value + 1)} />
        </div>

        {/* FULL-WIDTH DRINK LOG */}
        <DrinkLog
          logs={logs}
          busy={busy}
          editingId={editingId}
          editAmount={editAmount}
          onStartEdit={(log) => {
            setEditingId(log.id);
            setEditAmount(String(log.amount_ml));
          }}
          onEditAmountChange={setEditAmount}
          onCancelEdit={() => setEditingId(null)}
          onSaveEdit={saveEdit}
          onDelete={deleteLog}
          onReset={resetToday}
        />
      </div>
    </main>
  );
}
