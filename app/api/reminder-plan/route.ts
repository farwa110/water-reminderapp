import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getReminderTime } from "@/lib/reminderTime";
import { syncReminderPlan } from "@/lib/syncReminderPlan";

export const runtime = "nodejs";

type WaterLog = {
  id: string;
  amount_ml: number;
  drank_at: string;
};

export async function POST(request: Request) {
  // Step 1: Only accept requests made from this website.
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  }

  try {
    // Step 2: Use the signed-in user's ID, never an ID from the browser.
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    const body: unknown = await request.json();
    const input = typeof body === "object" && body !== null ? body : {};
    const action = "action" in input ? input.action : undefined;

    if (action !== undefined && action !== "set-reminders") {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const db = createSupabaseAdmin();
    const { data: settings, error: settingsError } = await db.from("user_settings").select("goal_ml, wake_time, sleep_time, timezone, reminders_on").eq("user_id", userId).maybeSingle();

    if (settingsError) throw settingsError;

    if (!settings) {
      return NextResponse.json({ error: "Complete your setup first.", needsOnboarding: true }, { status: 404 });
    }

    if (!Number.isFinite(settings.goal_ml) || settings.goal_ml <= 0 || !settings.wake_time || !settings.sleep_time) {
      return NextResponse.json({ error: "Please complete your goal and routine settings." }, { status: 422 });
    }

    // Step 3: Save the device timezone only if the account has none yet.
    // This also lets users view a plan before enabling notifications.
    if (!settings.timezone) {
      const timezone = "timezone" in input ? input.timezone : undefined;

      if (typeof timezone !== "string" || !DateTime.now().setZone(timezone).isValid) {
        return NextResponse.json({ error: "A valid reminder timezone is required." }, { status: 400 });
      }

      const { error } = await db.from("user_settings").update({ timezone }).eq("user_id", userId).is("timezone", null);

      if (error) throw error;
    }

    // When resuming reminders, skip times that passed while the bell was off.
    // Keep future slots so switching the bell does not move the plan.
    if (action === "set-reminders") {
      const enabled = "enabled" in input ? input.enabled : undefined;

      if (typeof enabled !== "boolean") {
        return NextResponse.json({ error: "Choose whether reminders should be on or off." }, { status: 400 });
      }

      if (enabled && !settings.reminders_on) {
        const { error } = await db.from("water_reminder_slots").update({ status: "skipped" }).eq("user_id", userId).eq("status", "pending").lte("scheduled_at", new Date().toISOString());

        if (error) throw error;
      }

      const { error } = await db.from("user_settings").update({ reminders_on: enabled, next_reminder_at: null }).eq("user_id", userId);

      if (error) throw error;
    }

    // Step 4: Load or rebuild the saved plan, even when the bell is off.
    for (let attempt = 0; attempt < 3; attempt++) {
      const plan = await syncReminderPlan(userId, db);
      const { dayStart, dayEnd, now } = getReminderTime(plan.settings.timezone!, plan.settings.wake_time, plan.settings.sleep_time);

      if (now.toISODate() !== plan.planDay) continue;

      // Step 5: Load today's drinks using the account's timezone.
      const logs: WaterLog[] = [];

      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db
          .from("water_logs")
          .select("id, amount_ml, drank_at")
          .eq("user_id", userId)
          .gte("drank_at", dayStart)
          .lt("drank_at", dayEnd)
          .order("drank_at", { ascending: false })
          .order("id")
          .range(offset, offset + 499);

        if (error) throw error;

        logs.push(
          ...(data ?? []).map((log) => ({
            ...log,
            amount_ml: Number(log.amount_ml),
          })),
        );

        if (!data || data.length < 500) break;
      }

      const totalMl = logs.reduce((sum, log) => sum + log.amount_ml, 0);

      // Retry if drinks changed while the plan and logs were loading.
      if (Math.max(plan.settings.goal_ml - totalMl, 0) !== plan.remainingMl) {
        continue;
      }

      const { data: currentPlan, error: currentPlanError } = await db.from("water_reminder_plans").select("plan_id").eq("user_id", userId).single();

      if (currentPlanError) throw currentPlanError;
      if (currentPlan.plan_id !== plan.planId) continue;

      // Step 6: Return saved times. The browser does not calculate new ones.
      return NextResponse.json(
        {
          settings: plan.settings,
          planId: plan.planId,
          planDay: plan.planDay,
          dayStart,
          dayEnd,
          logs,
          slots: plan.slots,
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    return NextResponse.json({ error: "Your data changed while loading. Please try again." }, { status: 409 });
  } catch (error) {
    console.error("Reminder plan loading failed", error);

    return NextResponse.json({ error: "Could not load your saved water plan. Please try again." }, { status: 500 });
  }
}
