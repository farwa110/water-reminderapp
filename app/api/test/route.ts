import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import webpush from "web-push";
import { createSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Only allow requests from this app.
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  }

  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (!publicKey || !privateKey || !subject) {
      return NextResponse.json({ error: "VAPID settings are missing on the server." }, { status: 500 });
    }

    const supabase = createSupabaseClient(() => getToken());

    const { data, error } = await supabase.from("push_subscriptions").select("id, subscription").eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: "Could not load your push subscriptions." }, { status: 500 });
    }

    if (!data?.length) {
      return NextResponse.json({ error: "Turn the reminder bell on first." }, { status: 404 });
    }

    const payload = JSON.stringify({
      title: "Ripple test reminder",
      body: "Your push notification is working!",
      //   tag: "ripple-test",
      tag: `ripple-test-${crypto.randomUUID()}`,
    });

    let sent = 0;
    let failed = 0;

    for (const row of data) {
      try {
        await webpush.sendNotification(row.subscription as webpush.PushSubscription, payload, {
          TTL: 60,
          timeout: 10_000,
          vapidDetails: { subject, publicKey, privateKey },
        });

        sent++;
      } catch (caught) {
        failed++;

        const statusCode = typeof caught === "object" && caught !== null && "statusCode" in caught ? Number(caught.statusCode) : undefined;

        // Remove expired subscriptions.
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", row.id).eq("user_id", userId);
        }
      }
    }

    return NextResponse.json(
      {
        sent,
        failed,
        ...(sent === 0 ? { error: "Push failed. Turn the bell off and on, then retry." } : {}),
      },
      { status: sent > 0 ? 200 : 502 },
    );
  } catch {
    return NextResponse.json({ error: "Could not send the test notification." }, { status: 500 });
  }
}
