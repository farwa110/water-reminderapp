import "server-only";
import { DateTime } from "luxon";

export function getReminderTime(timezone: string, wakeTime: string, sleepTime: string, nowMs = Date.now()) {
  const now = DateTime.fromMillis(nowMs, { zone: timezone });

  if (!now.isValid) {
    throw new Error("Invalid reminder timezone.");
  }

  function atTime(day: DateTime, time: string) {
    const [hour, minute] = time.split(":").map(Number);

    if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      throw new Error("Invalid routine time.");
    }

    return day.set({
      hour,
      minute,
      second: 0,
      millisecond: 0,
    });
  }

  if (wakeTime.slice(0, 5) === sleepTime.slice(0, 5)) {
    throw new Error("Wake time and bedtime must be different.");
  }

  const today = now.startOf("day");
  let wake = atTime(today, wakeTime);
  let sleep = atTime(today, sleepTime);

  // Overnight routine, such as 10:00–06:00.
  if (sleep.toMillis() <= wake.toMillis()) {
    if (now.toMillis() < sleep.toMillis()) {
      wake = atTime(today.minus({ days: 1 }), wakeTime);
    } else {
      sleep = atTime(today.plus({ days: 1 }), sleepTime);
    }
  }

  // If bedtime has passed, use the next awake period.
  if (now.toMillis() >= sleep.toMillis()) {
    wake = atTime(today.plus({ days: 1 }), wakeTime);
    sleep = atTime(today.plus({ days: 1 }), sleepTime);

    if (sleep.toMillis() <= wake.toMillis()) {
      sleep = atTime(today.plus({ days: 2 }), sleepTime);
    }
  }

  return {
    now,
    wake,
    sleep,
    isAwake: now.toMillis() >= wake.toMillis() && now.toMillis() < sleep.toMillis(),
    dayStart: today.toUTC().toISO()!,
    dayEnd: today.plus({ days: 1 }).toUTC().toISO()!,
  };
}
