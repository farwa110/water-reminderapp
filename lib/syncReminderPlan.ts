import "server-only";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildReminderPlan } from "@/lib/reminderPlan";
import { getReminderTime } from "@/lib/reminderTime";

type AdminClient = ReturnType<typeof createSupabaseAdmin>;

export type ReminderSettings = {
  user_id: string;
  goal_ml: number;
  wake_time: string;
  sleep_time: string;
  timezone: string | null;
  reminder_mode: string;
  reminders_on: boolean;
  next_reminder_at: string | null;
};

export type SavedReminderSlot = {
  id: string;
  plan_id: string;
  scheduled_at: string;
  amount_ml: number;
  status: string;
};

export async function syncReminderPlan(userId: string, db: AdminClient = createSupabaseAdmin()) {
  // Retry if another request changes the plan while we save.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: settingsData, error: settingsError } = await db
      .from("user_settings")
      .select("user_id, goal_ml, wake_time, sleep_time, timezone, " + "reminder_mode, reminders_on, next_reminder_at")
      .eq("user_id", userId)
      .single();

    if (settingsError) throw settingsError;

    const settings = settingsData as unknown as ReminderSettings;

    if (!settings.timezone) {
      throw new Error("Reminder timezone is missing.");
    }

    if (!Number.isFinite(settings.goal_ml) || settings.goal_ml <= 0) {
      throw new Error("Invalid daily water goal.");
    }

    const nowMs = Date.now();

    const { now, dayStart, dayEnd } = getReminderTime(settings.timezone, settings.wake_time, settings.sleep_time, nowMs);

    const planDay = now.toISODate();

    if (!planDay) {
      throw new Error("Could not determine the reminder date.");
    }

    // Read all today's logs, including users with many entries.
    let totalMl = 0;

    for (let offset = 0; ; offset += 500) {
      const { data: logs, error: logsError } = await db
        .from("water_logs")
        .select("id, amount_ml")
        .eq("user_id", userId)
        .gte("drank_at", dayStart)
        .lt("drank_at", dayEnd)
        .order("id")
        .range(offset, offset + 499);

      if (logsError) throw logsError;

      for (const log of logs ?? []) {
        const amount = Number(log.amount_ml);

        if (!Number.isFinite(amount)) {
          throw new Error("Invalid water log amount.");
        }

        totalMl += amount;
      }

      if (!logs || logs.length < 500) break;
    }

    const remainingMl = Math.max(settings.goal_ml - totalMl, 0);

    // Bell state is deliberately excluded:
    // switching notifications off keeps the upcoming plan.
    const inputKey = JSON.stringify({
      version: 1,
      planDay,
      timezone: settings.timezone,
      wakeTime: settings.wake_time,
      sleepTime: settings.sleep_time,
      goalMl: settings.goal_ml,
      mode: settings.reminder_mode,
      totalMl,
    });

    const { data: existingPlan, error: planError } = await db.from("water_reminder_plans").select("plan_id, plan_day, input_key").eq("user_id", userId).maybeSingle();

    if (planError) throw planError;

    const needsNewPlan = !existingPlan || existingPlan.plan_day !== planDay || existingPlan.input_key !== inputKey;

    let planId: string;

    if (needsNewPlan) {
      const slots = buildReminderPlan({
        timezone: settings.timezone,
        wakeTime: settings.wake_time,
        sleepTime: settings.sleep_time,
        mode: settings.reminder_mode,
        remainingMl,
        nowMs,
      });

      const { data: saved, error: saveError } = await db.rpc("save_water_reminder_plan", {
        p_user_id: userId,
        p_plan_day: planDay,
        p_input_key: inputKey,
        p_expected_plan_id: existingPlan?.plan_id ?? null,

        p_expected_settings: {
          goal_ml: settings.goal_ml,
          wake_time: settings.wake_time,
          sleep_time: settings.sleep_time,
          timezone: settings.timezone,
          reminder_mode: settings.reminder_mode,
          reminders_on: settings.reminders_on,
        },

        p_expected_total_ml: totalMl,
        p_day_start: dayStart,
        p_day_end: dayEnd,
        p_slots: slots,
      });

      if (saveError) throw saveError;

      // Settings, logs or plan changed during this request.
      if (saved !== true) continue;

      const { data: savedPlan, error: savedPlanError } = await db.from("water_reminder_plans").select("plan_id, input_key").eq("user_id", userId).single();

      if (savedPlanError) throw savedPlanError;

      if (savedPlan.input_key !== inputKey) continue;

      planId = savedPlan.plan_id;
    } else {
      planId = existingPlan.plan_id;
    }

    const { data: slots, error: slotsError } = await db.from("water_reminder_slots").select("id, plan_id, scheduled_at, amount_ml, status").eq("user_id", userId).eq("plan_id", planId).eq("status", "pending").order("scheduled_at");

    if (slotsError) throw slotsError;

    // Verify the plan wasn't replaced while its slots loaded.
    const { data: currentPlan, error: currentPlanError } = await db.from("water_reminder_plans").select("plan_id").eq("user_id", userId).single();

    if (currentPlanError) throw currentPlanError;

    if (currentPlan.plan_id !== planId) continue;

    return {
      settings,
      planId,
      planDay,
      remainingMl,
      slots: (slots ?? []) as SavedReminderSlot[],
      rebuilt: needsNewPlan,
    };
  }

  throw new Error("Reminder settings changed while saving. Please try again.");
}
