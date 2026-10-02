// lib/greetingTime.ts
import { Sun, Sunset, Moon } from "lucide-react";

export function greetingTime(date: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Copenhagen",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(date),
  );

  if (hour >= 5 && hour < 12) {
    return { text: "Good morning", Icon: Sun };
  }

  if (hour >= 12 && hour < 17) {
    return { text: "Good afternoon", Icon: Sun };
  }

  if (hour >= 17 && hour < 22) {
    return { text: "Good evening", Icon: Sunset };
  }

  return { text: "Good night", Icon: Moon };
}
