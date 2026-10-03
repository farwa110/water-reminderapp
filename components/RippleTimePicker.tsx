"use client";

import { useEffect, useState } from "react";
import RippleSelect from "@/components/RippleSelect";

const hourOptions = Array.from({ length: 24 }, (_, index) => {
  const value = String(index).padStart(2, "0");
  return { value, label: value };
});

const minuteOptions = Array.from({ length: 60 }, (_, index) => {
  const value = String(index).padStart(2, "0");
  return { value, label: value };
});

type Props = {
  name: string;
  label: string;
  defaultValue: string;
};

export default function RippleTimePicker({ name, label, defaultValue }: Props) {
  const [time, setTime] = useState(defaultValue);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("ripple-onboarding");
      if (!saved) return;

      const answers = JSON.parse(saved);
      const savedTime = answers?.[name];

      if (typeof savedTime === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(savedTime)) {
        setTime(savedTime);
      }
    } catch {
      // Keep the default time.
    }
  }, [name]);

  const [hour, minute] = time.split(":");

  return (
    <div className="min-w-0">
      <input type="hidden" name={name} value={time} />

      <div key={time} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <RippleSelect name={`${name}-hour`} label={`${label} hour`} defaultValue={hour} options={hourOptions} onValueChange={(nextHour) => setTime(`${nextHour}:${minute}`)} />

        <span aria-hidden="true" className="font-bold text-(--teal)">
          :
        </span>

        <RippleSelect name={`${name}-minute`} label={`${label} minute`} defaultValue={minute} options={minuteOptions} onValueChange={(nextMinute) => setTime(`${hour}:${nextMinute}`)} />
      </div>
    </div>
  );
}
