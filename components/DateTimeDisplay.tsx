"use client";

import { useEffect, useState } from "react";

export default function DateTimeDisplay() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) return null;

  return (
    <p className="mt-2 text-sm text-(--muted)">
      {now.toLocaleDateString("en-DK", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
      {" · "}
      {now.toLocaleTimeString("en-DK", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </p>
  );
}
