// import { timingSafeEqual } from "node:crypto";
// import { NextResponse } from "next/server";
// import { DateTime } from "luxon";
// import webpush from "web-push";
// import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
// import { getReminderTime } from "@/lib/reminderTime";

// export const runtime = "nodejs";

// type Settings = {
//   user_id: string;
//   goal_ml: number;
//   wake_time: string;
//   sleep_time: string;
//   timezone: string | null;
//   reminder_mode: string;
//   next_reminder_at: string | null;
// };

// export async function POST(request: Request) {
//   const secret = process.env.CRON_SECRET;
//   const supplied = request.headers.get("authorization") ?? "";
//   const expected = `Bearer ${secret}`;

//   if (!secret) {
//     return NextResponse.json({ error: "Cron configuration missing." }, { status: 500 });
//   }

//   if (Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
//     return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//   }

//   const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
//   const privateKey = process.env.VAPID_PRIVATE_KEY;
//   const subject = process.env.VAPID_SUBJECT;

//   if (!publicKey || !privateKey || !subject) {
//     return NextResponse.json({ error: "Push configuration missing." }, { status: 500 });
//   }

//   try {
//     const db = createSupabaseAdmin();
//     const users: Settings[] = [];

//     // Read settings in pages.
//     for (let offset = 0; ; offset += 500) {
//       const { data, error } = await db
//         .from("user_settings")
//         .select("user_id, goal_ml, wake_time, sleep_time, timezone, reminder_mode, next_reminder_at")
//         .eq("reminders_on", true)
//         .order("user_id")
//         .range(offset, offset + 499);

//       if (error) throw error;

//       users.push(...((data ?? []) as Settings[]));
//       if (!data || data.length < 500) break;
//     }

//     let sent = 0;
//     let scheduled = 0;
//     let failed = 0;

//     for (const settings of users) {
//       try {
//         if (!settings.timezone) continue;

//         const { now, wake, sleep, isAwake, dayStart, dayEnd } = getReminderTime(settings.timezone, settings.wake_time, settings.sleep_time);

//         const { data: logs, error: logsError } = await db.from("water_logs").select("amount_ml").eq("user_id", settings.user_id).gte("drank_at", dayStart).lt("drank_at", dayEnd);

//         if (logsError) throw logsError;

//         const totalMl = (logs ?? []).reduce((sum, log) => sum + Number(log.amount_ml), 0);

//         const remainingMl = Math.max(settings.goal_ml - totalMl, 0);

//         // Compare the original schedule before updating it.
//         // This avoids overwriting a changed mode or disabled bell.
//         async function saveNext(at: string) {
//           let query = db.from("user_settings").update({ next_reminder_at: at }).eq("user_id", settings.user_id).eq("reminders_on", true).eq("reminder_mode", settings.reminder_mode).eq("timezone", settings.timezone!).eq("wake_time", settings.wake_time).eq("sleep_time", settings.sleep_time).eq("goal_ml", settings.goal_ml);

//           query = settings.next_reminder_at ? query.eq("next_reminder_at", settings.next_reminder_at) : query.is("next_reminder_at", null);

//           const { error } = await query;
//           if (error) throw error;
//         }

//         function nextTime() {
//           const midnight = now.startOf("day").plus({ days: 1 });

//           // Recheck tomorrow's goal after midnight.
//           if (remainingMl <= 0) return midnight.toUTC().toISO()!;

//           // Wake time is a checkpoint; no push during sleep.
//           if (!isAwake) return wake.toUTC().toISO()!;

//           // Recalculate at midnight so today's goal isn't carried over.
//           const finishMs = Math.min(sleep.minus({ minutes: 1 }).toMillis(), midnight.toMillis());

//           const availableMs = finishMs - now.toMillis();
//           const needed = Math.ceil(remainingMl / 250);

//           let gapMs: number;

//           if (settings.reminder_mode === "auto") {
//             const count = Math.min(needed, Math.floor(availableMs / (30 * 60_000)));

//             if (count <= 0) {
//               return DateTime.fromMillis(Math.min(sleep.toMillis(), midnight.toMillis())).toUTC().toISO()!;
//             }

//             gapMs = availableMs / count;
//           } else {
//             const minutes = Number(settings.reminder_mode);

//             if (![30, 60, 120].includes(minutes)) {
//               throw new Error("Invalid reminder mode.");
//             }

//             gapMs = minutes * 60_000;
//           }

//           const target = now.toMillis() + gapMs;

//           if (target > finishMs) {
//             return DateTime.fromMillis(Math.min(sleep.toMillis(), midnight.toMillis())).toUTC().toISO()!;
//           }

//           return DateTime.fromMillis(Math.round(target)).toUTC().toISO()!;
//         }

//         const dueAt = settings.next_reminder_at ? DateTime.fromISO(settings.next_reminder_at) : null;

//         if (dueAt && !dueAt.isValid) {
//           throw new Error("Invalid scheduled time.");
//         }

//         // Initialize, or move to the next awake/day checkpoint.
//         if (!dueAt || !isAwake || remainingMl <= 0) {
//           await saveNext(nextTime());
//           scheduled++;
//           continue;
//         }

//         if (dueAt.toMillis() > now.toMillis()) continue;

//         // Skip old reminders instead of sending a late burst.
//         if (now.toMillis() - dueAt.toMillis() > 5 * 60_000) {
//           await saveNext(nextTime());
//           scheduled++;
//           continue;
//         }

//         const { data: token, error: claimError } = await db.rpc("claim_water_reminder", {
//           p_user_id: settings.user_id,
//           p_scheduled_at: settings.next_reminder_at,
//         });

//         if (claimError) throw claimError;

//         if (!token) {
//           const { data: delivery, error } = await db.from("reminder_deliveries").select("status, attempts, locked_until").eq("user_id", settings.user_id).eq("scheduled_at", settings.next_reminder_at!).maybeSingle();

//           if (error) throw error;

//           const exhausted = delivery && delivery.attempts >= 3 && (!delivery.locked_until || Date.parse(delivery.locked_until) <= Date.now());

//           if (delivery?.status === "sent" || exhausted) {
//             await saveNext(nextTime());
//           }

//           continue;
//         }

//         const { data: subscriptions, error: subscriptionError } = await db.from("push_subscriptions").select("id, subscription").eq("user_id", settings.user_id);

//         if (subscriptionError) throw subscriptionError;

//         let accepted = 0;

//         for (const row of subscriptions ?? []) {
//           try {
//             await webpush.sendNotification(
//               row.subscription as webpush.PushSubscription,
//               JSON.stringify({
//                 title: "Time for a water break",
//                 body: "Take a little sip. Log your glass after drinking.",
//                 tag: `ripple-${settings.next_reminder_at}`,
//               }),
//               {
//                 TTL: 120,
//                 timeout: 10_000,
//                 vapidDetails: { subject, publicKey, privateKey },
//               },
//             );

//             accepted++;
//           } catch (caught) {
//             const status = typeof caught === "object" && caught !== null && "statusCode" in caught ? Number(caught.statusCode) : undefined;

//             if (status === 404 || status === 410) {
//               const { error } = await db.from("push_subscriptions").delete().eq("id", row.id);

//               if (error) throw error;
//             }
//           }
//         }

//         const { error: deliveryError } = await db
//           .from("reminder_deliveries")
//           .update({
//             status: accepted > 0 ? "sent" : "failed",
//             sent_at: accepted > 0 ? new Date().toISOString() : null,
//             locked_until: null,
//           })
//           .eq("user_id", settings.user_id)
//           .eq("scheduled_at", settings.next_reminder_at!)
//           .eq("claim_token", token);

//         if (deliveryError) throw deliveryError;

//         if (accepted > 0) {
//           sent++;
//           await saveNext(nextTime());
//         } else {
//           failed++;
//         }
//       } catch {
//         failed++;
//       }
//     }

//     return NextResponse.json({ sent, scheduled, failed });
//   } catch {
//     return NextResponse.json({ error: "Could not process reminders." }, { status: 500 });
//   }
// }

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import webpush from "web-push";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getReminderTime } from "@/lib/reminderTime";
import { syncReminderPlan } from "@/lib/syncReminderPlan";

export const runtime = "nodejs";

const MAX_LATENESS_MS = 5 * 60_000;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Cron configuration missing." }, { status: 500 });
  }

  const supplied = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  if (Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return NextResponse.json({ error: "Push configuration missing." }, { status: 500 });
  }

  try {
    const db = createSupabaseAdmin();
    const userIds: string[] = [];

    for (let offset = 0; ; offset += 500) {
      const { data, error } = await db
        .from("user_settings")
        .select("user_id")
        .eq("reminders_on", true)
        .order("user_id")
        .range(offset, offset + 499);

      if (error) throw error;

      userIds.push(...(data ?? []).map((row) => String(row.user_id)));

      if (!data || data.length < 500) break;
    }

    let sent = 0;
    let scheduled = 0;
    let skipped = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        const plan = await syncReminderPlan(userId, db);
        const { settings, planId, remainingMl, slots } = plan;

        if (plan.rebuilt) scheduled++;

        if (!settings.reminders_on || !settings.timezone) {
          continue;
        }

        const { now, isAwake } = getReminderTime(settings.timezone, settings.wake_time, settings.sleep_time);

        const nowMs = now.toMillis();

        async function markSlot(slotId: string, status: "sent" | "skipped") {
          const { error } = await db.from("water_reminder_slots").update({ status }).eq("id", slotId).eq("user_id", userId).eq("plan_id", planId).eq("status", "pending");

          if (error) throw error;
        }

        async function refreshNextReminder() {
          const { data: currentPlan, error: planError } = await db.from("water_reminder_plans").select("plan_id").eq("user_id", userId).maybeSingle();

          if (planError) throw planError;
          if (currentPlan?.plan_id !== planId) return;

          const { data: nextSlot, error: nextError } = await db.from("water_reminder_slots").select("scheduled_at").eq("user_id", userId).eq("plan_id", planId).eq("status", "pending").order("scheduled_at").limit(1).maybeSingle();

          if (nextError) throw nextError;

          let query = db
            .from("user_settings")
            .update({
              next_reminder_at: nextSlot?.scheduled_at ?? null,
            })
            .eq("user_id", userId)
            .eq("reminders_on", true)
            .eq("timezone", settings.timezone!)
            .eq("reminder_mode", settings.reminder_mode)
            .eq("wake_time", settings.wake_time)
            .eq("sleep_time", settings.sleep_time)
            .eq("goal_ml", settings.goal_ml);

          query = settings.next_reminder_at ? query.eq("next_reminder_at", settings.next_reminder_at) : query.is("next_reminder_at", null);

          const { error } = await query;

          if (error) throw error;
        }

        const dueSlots = slots.filter((slot) => Date.parse(slot.scheduled_at) <= nowMs);

        // No notifications during sleep or after completing the goal.
        if (!isAwake || remainingMl <= 0) {
          for (const slot of dueSlots) {
            await markSlot(slot.id, "skipped");
            skipped++;
          }

          await refreshNextReminder();
          continue;
        }

        // Send at most one due reminder per user in this run.
        // Older due slots are skipped to avoid a catch-up burst.
        const latestDue = dueSlots.at(-1);

        for (const slot of dueSlots) {
          const tooLate = nowMs - Date.parse(slot.scheduled_at) > MAX_LATENESS_MS;

          if (slot.id !== latestDue?.id || tooLate) {
            await markSlot(slot.id, "skipped");
            skipped++;
          }
        }

        if (!latestDue || nowMs - Date.parse(latestDue.scheduled_at) > MAX_LATENESS_MS) {
          await refreshNextReminder();
          continue;
        }

        const { data: subscriptions, error: subscriptionError } = await db.from("push_subscriptions").select("id, subscription").eq("user_id", userId);

        if (subscriptionError) throw subscriptionError;

        // Recheck saved settings and slot before each push request.
        async function canSend() {
          const { data: liveSettings, error: settingsError } = await db
            .from("user_settings")
            .select("reminders_on, timezone, reminder_mode, " + "wake_time, sleep_time, goal_ml")
            .eq("user_id", userId)
            .single();

          if (settingsError) throw settingsError;

          const live = liveSettings as unknown as {
            reminders_on: boolean;
            timezone: string | null;
            reminder_mode: string;
            wake_time: string;
            sleep_time: string;
            goal_ml: number;
          };

          if (!live.reminders_on || live.timezone !== settings.timezone || live.reminder_mode !== settings.reminder_mode || live.wake_time !== settings.wake_time || live.sleep_time !== settings.sleep_time || live.goal_ml !== settings.goal_ml) {
            return false;
          }

          const { data: currentPlan, error: planError } = await db.from("water_reminder_plans").select("plan_id").eq("user_id", userId).maybeSingle();

          if (planError) throw planError;
          if (currentPlan?.plan_id !== planId) return false;

          const { data: liveSlot, error: slotError } = await db.from("water_reminder_slots").select("status").eq("id", latestDue!.id).eq("plan_id", planId).maybeSingle();

          if (slotError) throw slotError;
          if (liveSlot?.status !== "pending") return false;

          const currentTime = getReminderTime(settings.timezone!, settings.wake_time, settings.sleep_time);

          return currentTime.isAwake && Date.now() - Date.parse(latestDue!.scheduled_at) <= MAX_LATENESS_MS;
        }

        if (!(await canSend())) continue;

        const { data: token, error: claimError } = await db.rpc("claim_water_reminder", {
          p_user_id: userId,
          p_scheduled_at: latestDue.scheduled_at,
        });

        if (claimError) throw claimError;

        if (!token) {
          const { data: delivery, error: deliveryError } = await db.from("reminder_deliveries").select("status, attempts, locked_until").eq("user_id", userId).eq("scheduled_at", latestDue.scheduled_at).maybeSingle();

          if (deliveryError) throw deliveryError;

          const exhausted = delivery && delivery.attempts >= 3 && (!delivery.locked_until || Date.parse(delivery.locked_until) <= Date.now());

          if (delivery?.status === "sent") {
            await markSlot(latestDue.id, "sent");
          } else if (exhausted) {
            await markSlot(latestDue.id, "skipped");
            skipped++;
          }

          await refreshNextReminder();
          continue;
        }

        let accepted = 0;

        try {
          for (const row of subscriptions ?? []) {
            if (!(await canSend())) break;

            try {
              await webpush.sendNotification(
                row.subscription as webpush.PushSubscription,
                JSON.stringify({
                  title: "Ripple · Time for a water break",
                  body: "Take a little sip. Log your glass after drinking.",
                  tag: `ripple-${latestDue.scheduled_at}`,
                }),
                {
                  TTL: 120,
                  timeout: 10_000,
                  vapidDetails: {
                    subject,
                    publicKey,
                    privateKey,
                  },
                },
              );

              accepted++;
            } catch (caught) {
              const status = typeof caught === "object" && caught !== null && "statusCode" in caught ? Number(caught.statusCode) : undefined;

              if (status === 404 || status === 410) {
                const { error } = await db.from("push_subscriptions").delete().eq("id", row.id).eq("user_id", userId);

                if (error) throw error;
              }

              console.error("Reminder push failed", {
                statusCode: status ?? null,
              });
            }
          }
        } finally {
          const { error } = await db
            .from("reminder_deliveries")
            .update({
              status: accepted > 0 ? "sent" : "failed",
              sent_at: accepted > 0 ? new Date().toISOString() : null,
              locked_until: null,
            })
            .eq("user_id", userId)
            .eq("scheduled_at", latestDue.scheduled_at)
            .eq("claim_token", token);

          if (error) throw error;
        }

        if (accepted > 0) {
          await markSlot(latestDue.id, "sent");
          sent++;
        } else {
          failed++;
        }

        await refreshNextReminder();
      } catch (error) {
        console.error("Reminder processing failed", error);
        failed++;
      }
    }

    return NextResponse.json({
      sent,
      scheduled,
      skipped,
      failed,
    });
  } catch (error) {
    console.error("Reminder cron failed", error);

    return NextResponse.json({ error: "Could not process reminders." }, { status: 500 });
  }
}

// 1. Cron setup: Supabase Cron runs every minute and sends a POST request to /api/cron. The route checks the CRON_SECRET, loads users whose reminders are switched on, and checks their saved reminder slots. When a reminder is due and the user is awake, it sends a push notification to their registered devices. It records the delivery result, skips reminders that are too late, and updates next_reminder_at to the next pending slot.

// 2. Reminder setup and sync: syncReminderPlan.ts loads the user’s daily goal, water logs, timezone, wake/sleep times and selected interval. It reuses the saved plan unless the local date, settings or water total changes. When needed, reminderPlan.ts calculates new times, and the database saves the plan in water_reminder_plans and its individual times in water_reminder_slots. Switching the bell off keeps the plan saved while stopping future notification sending.

// 3. Frontend connection — remaining: The upcoming plan on the dashboard will read these same saved slots, so the displayed times match the times cron uses. This connection still needs to be implemented and tested.
