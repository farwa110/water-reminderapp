"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Droplet, X, CircleCheck } from "lucide-react";
import { formatTime } from "@/lib/utils";
import MobileBottomSheet from "@/components/MobileBottomSheet";
import { useSession, useUser } from "@clerk/nextjs";
import { createSupabaseClient } from "@/lib/supabase";
import { enablePushNotifications } from "@/lib/pushNotifications";

type PlanItem = {
  at: number;
  amount: number;
};

type Props = {
  plan: PlanItem[];
  mode: "auto" | 30 | 60 | 120;
  remainingMl: number;
  wakeTime: string;
  sleepTime: string;
  busy: boolean;
  onRemindersEnabled: () => void;
  onChooseMode: (mode: "auto" | 30 | 60 | 120) => Promise<void>;
};

function isAwake(wakeTime: string, sleepTime: string) {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (time: string) => {
    const [hours, mins] = time.split(":").map(Number);
    return hours * 60 + mins;
  };

  const wake = toMinutes(wakeTime);
  const sleep = toMinutes(sleepTime);

  return wake < sleep ? minutes >= wake && minutes < sleep : minutes >= wake || minutes < sleep;
}

export default function WaterReminders({ plan, mode, remainingMl, wakeTime, sleepTime, busy, onChooseMode, onRemindersEnabled }: Props) {
  const { user } = useUser();
  const { session } = useSession();

  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState("");
  const pushLock = useRef(false);
  /**bell  */
  const [enabled, setEnabled] = useState(false);
  const [popup, setPopup] = useState<PlanItem | null>(null);
  const [snoozed, setSnoozed] = useState<PlanItem | null>(null);
  const [soundError, setSoundError] = useState("");

  const audioRef = useRef<AudioContext | null>(null);
  const handledRef = useRef(new Set<number>());
  const previousRemaining = useRef(remainingMl);
  const previousPlan = useRef(plan);

  async function playBell() {
    try {
      const context = audioRef.current ?? new AudioContext();
      audioRef.current = context;

      await context.resume();

      if (context.state !== "running") {
        throw new Error("Audio unavailable");
      }

      // Two soft bell notes. No sound file required.
      [880, 1174.66].forEach((frequency, index) => {
        const start = context.currentTime + index * 0.18;
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 1.2);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(start);
        oscillator.stop(start + 1.25);
      });

      setSoundError("");
    } catch {
      setSoundError("Sound could not play. Tap Test reminder to try again.");
    }
  }

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
    };
  }, []);

  // Logging water or changing the plan clears the current reminder.
  useEffect(() => {
    if (previousRemaining.current !== remainingMl || previousPlan.current !== plan) {
      setPopup(null);
      setSnoozed(null);
    }

    previousRemaining.current = remainingMl;
    previousPlan.current = plan;
  }, [remainingMl, plan]);

  useEffect(() => {
    if (!enabled || remainingMl <= 0) return;

    function checkReminder() {
      const now = Date.now();

      if (!isAwake(wakeTime, sleepTime)) {
        setPopup(null);
        return;
      }

      // Wait until the page is visible before showing a popup.
      if (document.visibilityState !== "visible") return;

      if (snoozed) {
        if (now >= snoozed.at) {
          setPopup(snoozed);
          setSnoozed(null);
          void playBell();
        }
        return;
      }

      const due = plan.filter((item) => item.at <= now && !handledRef.current.has(item.at));

      // Mark all past prompts handled to avoid a burst of reminders.
      due.forEach((item) => handledRef.current.add(item.at));

      const latest = due[due.length - 1];

      if (!popup && latest && now - latest.at < 5 * 60_000) {
        setPopup(latest);
        void playBell();
      }
    }

    checkReminder();

    const timer = window.setInterval(checkReminder, 1000);
    document.addEventListener("visibilitychange", checkReminder);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", checkReminder);
    };
  }, [enabled, remainingMl, plan, popup, snoozed, wakeTime, sleepTime]);

  // function toggleBell() {
  //   if (enabled) {
  //     setEnabled(false);
  //     setPopup(null);
  //     setSnoozed(null);
  //     return;
  //   }

  //   // Skip reminders that passed while the bell was off.
  //   plan.forEach((item) => {
  //     if (item.at <= Date.now()) {
  //       handledRef.current.add(item.at);
  //     }
  //   });

  //   setEnabled(true);
  //   void playBell();
  // }
  async function toggleBell() {
    if (!user || !session || busy || pushLock.current) return;

    pushLock.current = true;
    setPushBusy(true);
    setPushError("");

    try {
      const supabase = createSupabaseClient(() => session.getToken());

      if (enabled) {
        const { error } = await supabase.from("user_settings").update({ reminders_on: false }).eq("user_id", user.id).select("user_id").single();

        if (error) throw error;

        setEnabled(false);
        setPopup(null);
        setSnoozed(null);
        return;
      }

      const subscription = await enablePushNotifications();

      if (!subscription.endpoint || !subscription.keys) {
        throw new Error("Could not create a valid push subscription.");
      }

      const { error: subscriptionError } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          subscription,
        },
        {
          onConflict: "user_id,endpoint",
        },
      );

      if (subscriptionError) throw subscriptionError;

      const { error: settingsError } = await supabase.from("user_settings").update({ reminders_on: true }).eq("user_id", user.id).select("user_id").single();

      if (settingsError) throw settingsError;

      plan.forEach((item) => {
        if (item.at <= Date.now()) {
          handledRef.current.add(item.at);
        }
      });

      // setEnabled(true);
      onRemindersEnabled();
      setEnabled(true);
      void playBell();
    } catch (error) {
      const message = error instanceof Error ? error.message : typeof error === "object" && error !== null && "message" in error ? String(error.message) : "Could not update reminders. Please try again.";

      setPushError(message);
    } finally {
      pushLock.current = false;
      setPushBusy(false);
    }
  }

  // function testReminder() {
  //   setPopup({
  //     at: Date.now(),
  //     amount: Math.min(250, remainingMl),
  //   });
  //   void playBell();
  // }

  async function testReminder() {
    if (pushLock.current) return;

    pushLock.current = true;
    setPushBusy(true);
    setPushError("");

    try {
      // const response = await fetch("/api/push/test", {
      const response = await fetch("/api/test", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Test notification failed.");
      }
    } catch (caught) {
      setPushError(caught instanceof Error ? caught.message : "Test notification failed.");
    } finally {
      pushLock.current = false;
      setPushBusy(false);
    }
  }

  function snoozeReminder() {
    if (!popup) return;

    setSnoozed({
      at: Date.now() + 10 * 60_000,
      amount: popup.amount,
    });
    setPopup(null);
  }

  const nextReminder = snoozed ?? plan.find((item) => !handledRef.current.has(item.at));

  const plannedMl = plan.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-w-0 space-y-6">
      <MobileBottomSheet position="left" title="Water reminders" icon={<Bell size={22} strokeWidth={1.7} />} summary={enabled ? "Reminders on" : "Reminders off"}>
        <section className="rounded-3xl border border-(--border) bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Water reminders</h2>
              <p className="mt-1 text-sm text-(--muted)">{enabled ? "Reminders and bell sound on" : "Tap the bell to enable reminders"}</p>
            </div>

            {/* <button type="button" onClick={toggleBell} aria-pressed={enabled} aria-label={enabled ? "Turn reminders off" : "Turn reminders on"} title={enabled ? "Turn reminders off" : "Turn reminders on"} className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-colors ${enabled ? "border-(--teal) bg-(--teal) text-white" : "border-(--border) bg-(--teal-light) text-(--teal) disabled:cursor-not-allowed disabled:opacity-50"}`}>
              {enabled ? <Bell size={25} strokeWidth={1.7} /> : <BellOff size={25} strokeWidth={1.7} />}
            </button> */}
            <button
              type="button"
              onClick={() => void toggleBell()}
              disabled={busy || pushBusy || !user || !session}
              aria-pressed={enabled}
              aria-busy={pushBusy}
              aria-label={enabled ? "Turn reminders off" : "Turn reminders on"}
              title={enabled ? "Turn reminders off" : "Turn reminders on"}
              className={`flex h-14 w-14 shrink-0 items-center justify-center
              rounded-full border transition-colors
              disabled:cursor-not-allowed disabled:opacity-50
              ${enabled ? "border-(--teal) bg-(--teal) text-white" : "border-(--border) bg-(--teal-light) text-(--teal)"}`}
            >
              {enabled ? <Bell size={25} strokeWidth={1.7} /> : <BellOff size={25} strokeWidth={1.7} />}
            </button>
          </div>

          {pushError && (
            <p role="alert" className="mt-3 text-sm text-(--coral)">
              {pushError}
            </p>
          )}

          {soundError && (
            <p role="status" className="mt-3 text-xs text-(--coral)">
              {soundError}
            </p>
          )}

          <p className="mt-5 text-sm font-semibold">Plan timing</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                { value: "auto", label: "Auto · until bedtime" },
                { value: 30, label: "Every 30 minutes" },
                { value: 60, label: "Every 1 hour" },
                { value: 120, label: "Every 2 hours" },
              ] as const
            ).map((option) => (
              <button key={option.value} type="button" disabled={busy} aria-pressed={mode === option.value} onClick={() => void onChooseMode(option.value)} className={`rounded-xl border px-3 py-3 text-sm font-semibold disabled:opacity-50 ${mode === option.value ? "border-(--teal) bg-(--teal-light) text-(--teal)" : "border-(--border) text-(--muted)"}`}>
                {option.label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-sm leading-6 text-(--muted)">{mode === "auto" ? "Remaining glasses are spaced through your awake hours." : "Your plan adjusts when you log water. Reminders stop before bedtime."}</p>

          <div className="mt-5 rounded-2xl bg-(--teal-light) p-5">
            <p className="text-sm text-(--muted)">{remainingMl === 0 ? "Goal reached · no more reminders today" : !nextReminder ? "No upcoming reminders in this awake period" : enabled ? (snoozed ? "Snoozed until" : "Next reminder") : "Next planned break · bell off"}</p>

            {nextReminder && remainingMl > 0 && <p className="mt-2 text-4xl font-bold text-(--teal)">{formatTime(nextReminder.at)}</p>}
          </div>

          {/* <button type="button" disabled={!enabled || remainingMl <= 0 || busy} onClick={testReminder} className="mt-4 flex items-center gap-2 text-sm font-semibold text-(--teal) disabled:opacity-40">
            <Bell size={16} />
            Test reminder
          </button> */}
          <button type="button" onClick={() => void testReminder()} disabled={!enabled || busy || pushBusy} className="mt-4 flex items-center gap-2 text-sm font-semibold text-(--teal) disabled:opacity-40">
            <Bell size={16} />
            {pushBusy ? "Please wait…" : "Test reminder"}
          </button>

          <p className="mt-3 text-xs leading-5 text-(--muted)">Keep this dashboard open for reminders. Background tabs may delay them. The bell starts off each time you open the dashboard.</p>
        </section>
      </MobileBottomSheet>

      {/* <MobileBottomSheet position="right" title="Today’s water plan" icon={<Droplet size={22} strokeWidth={1.7} />} summary={`${plan.length} planned water ${plan.length === 1 ? "break" : "breaks"}`}> */}
      <MobileBottomSheet position="right" title="Today’s water plan" icon={<Droplet size={22} strokeWidth={1.7} />} summary={`${plan.length} planned water breaks`}>
        <section className="rounded-3xl border border-(--border) bg-white p-6">
          <h2 className="text-xl font-bold">Upcoming water plan</h2>

          <p className="mt-2 text-sm leading-6 text-(--muted)">
            Awake {wakeTime.slice(0, 5)}–{sleepTime.slice(0, 5)}. These are suggested future breaks.
          </p>

          {plan.length > 0 ? (
            <ol className="mt-4 space-y-2">
              {plan.map((item) => (
                <li key={item.at} className="flex items-center justify-between gap-3 rounded-2xl bg-(--teal-light) px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Water break · {item.amount} ml</p>

                    <p className="mt-1 text-xs text-(--muted)">{handledRef.current.has(item.at) ? "Reminder passed" : "Planned"}</p>
                  </div>

                  {/* <time dateTime={new Date(item.at).toISOString()} className="shrink-0 font-semibold text-(--teal)">
                    {formatTime(item.at)}
                  </time> */}
                  <time dateTime={new Date(item.at).toISOString()} className="shrink-0 text-right font-semibold text-(--teal)">
                    <span className="block">{formatTime(item.at)}</span>

                    <span className="block text-xs font-normal text-(--muted)">
                      {new Date(item.at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-sm leading-6 text-(--muted)">
              {remainingMl === 0 ? (
                <>
                  <CircleCheck size={18} strokeWidth={1.5} className="shrink-0 text-(--teal)" aria-hidden="true" />
                  <span>You’ve reached your goal today.</span>
                </>
              ) : (
                "No suitable reminder slots remain before bedtime."
              )}
            </p>
          )}

          {plan.length > 0 && plannedMl < remainingMl && <p className="mt-4 text-sm text-(--muted)">This interval allows {plan.length} breaks before bedtime. The rest of your goal is not scheduled.</p>}

          <p className="mt-4 text-xs leading-5 text-(--muted)">A reminder does not record a drink. Tap “I drank one glass” after drinking to update your progress.</p>
        </section>
      </MobileBottomSheet>

      {popup && enabled && remainingMl > 0 && (
        <section role="region" aria-label="Water reminder" className="fixed bottom-5 left-4 right-4 z-50 rounded-3xl border border-white/80 bg-[#edf9f7]/95 p-6 text-[#19332f] shadow-xl backdrop-blur-xl sm:left-auto sm:right-6 sm:w-96">
          <button type="button" onClick={() => setPopup(null)} aria-label="Dismiss reminder" className="absolute right-4 top-4 rounded-full p-2 text-(--muted)">
            <X size={18} />
          </button>

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/80">
            <Droplet size={28} strokeWidth={1.5} stroke="#409e9e" fill="#409e9e" fillOpacity={0.25} />
          </div>

          <div role="status" aria-live="polite">
            <h3 className="text-2xl font-bold">Time for a little sip!</h3>
            <p className="mt-2 text-sm leading-6 text-(--muted)">Take a gentle water break. Log your glass after drinking.</p>
          </div>

          <button type="button" onClick={snoozeReminder} className="mt-4 rounded-xl bg-(--teal) px-4 py-3 text-sm font-semibold text-white">
            Snooze 10 minutes
          </button>
        </section>
      )}
    </div>
  );
}
