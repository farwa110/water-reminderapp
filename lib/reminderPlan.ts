import "server-only";
import { getReminderTime } from "@/lib/reminderTime";

export type ReminderSlot = {
  scheduled_at: string;
  amount_ml: number;
};

type PlanOptions = {
  timezone: string;
  wakeTime: string;
  sleepTime: string;
  mode: string;
  remainingMl: number;
  nowMs?: number;
};

export function buildReminderPlan({ timezone, wakeTime, sleepTime, mode, remainingMl, nowMs = Date.now() }: PlanOptions): ReminderSlot[] {
  if (!Number.isFinite(remainingMl) || remainingMl < 0) {
    throw new Error("Invalid remaining water amount.");
  }

  const manualMinutes = Number(mode);

  if (mode !== "auto" && ![30, 60, 120].includes(manualMinutes)) {
    throw new Error("Invalid reminder mode.");
  }

  const { now, wake, sleep } = getReminderTime(timezone, wakeTime, sleepTime, nowMs);

  if (remainingMl === 0) return [];

  // This plan belongs to the current local calendar day.
  // Tomorrow gets a fresh plan based on tomorrow's water logs.
  const tomorrow = now.startOf("day").plus({ days: 1 });

  const startMs = Math.max(now.toMillis(), wake.toMillis());

  // Keep reminders before bedtime and before the next day.
  const finishMs = Math.min(sleep.minus({ minutes: 1 }).toMillis(), tomorrow.minus({ minutes: 1 }).toMillis());

  const availableMs = finishMs - startMs;

  if (availableMs <= 0) return [];

  const needed = Math.ceil(remainingMl / 250);

  const intervalMs = mode === "auto" ? 30 * 60_000 : manualMinutes * 60_000;

  const count = Math.min(needed, Math.floor(availableMs / intervalMs));

  if (count <= 0) return [];

  // Auto spreads reminders across the available awake time.
  // Manual modes keep the selected interval.
  const gapMs = mode === "auto" ? availableMs / count : intervalMs;

  return Array.from({ length: count }, (_, index) => ({
    scheduled_at: new Date(Math.round(startMs + gapMs * (index + 1))).toISOString(),

    amount_ml: Math.min(250, remainingMl - index * 250),
  }));
}
