// Abhi notification nahi aayegi: next step mein is worker ko register karke device ki push subscription banayenge. Uske liye apna lib/supabase.ts code, secret values ke baghair, paste karo.
// Ab service worker banao—ye push receive karke notification show karega.

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      body: event.data ? event.data.text() : "",
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Time for a water break", {
      body: data.body || "Take a little sip. Log your glass in Ripple.",
      tag: data.tag || "ripple-water-reminder",
      data: {
        url: "/dashboard",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const targetUrl = new URL("/dashboard", self.location.origin).href;

      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windows) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }

      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin && "navigate" in client) {
          const navigated = await client.navigate(targetUrl);
          if (navigated) return navigated.focus();
        }
      }

      return self.clients.openWindow(targetUrl);
    })(),
  );
});
