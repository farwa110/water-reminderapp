// Ye service worker register karegi aur user ke device ki push subscription banayegi.

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");

  const decoded = window.atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length));

  for (let index = 0; index < decoded.length; index++) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return bytes;
}

export async function enablePushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    throw new Error("Push notifications are not supported on this browser.");
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("Missing VAPID public key. Restart your dev server.");
  }

  // Call this function directly from a user's button click.
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Allow notifications in your browser settings to enable reminders.");
  }

  await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });

  const registration = await navigator.serviceWorker.ready;

  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription.toJSON();
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  return subscription.toJSON();
}
