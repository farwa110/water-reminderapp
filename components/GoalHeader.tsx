"use client";

import { UserButton } from "@clerk/nextjs";
import { greetingTime } from "@/lib/greetingTime";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import WaterDrop from "@/components/WaterDrop";

type Props = {
  firstName: string;
  clock: Date | null;
};

export default function GoalHeader({ firstName, clock }: Props) {
  const currentGreeting = clock ? greetingTime(clock) : null;
  const GreetingIcon = currentGreeting?.Icon;

  return (
    <header className="relative overflow-hidden rounded-3xl border border-(--border) bg-white p-5 sm:p-6 lg:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-(--teal-light)" />

      <div className="relative flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-(--teal)">
            {currentGreeting ? currentGreeting.text : "Welcome to Ripple"}

            {GreetingIcon ? <GreetingIcon size={18} strokeWidth={1.7} aria-hidden="true" className="shrink-0" /> : <WaterDrop width={16} height={22} className="shrink-0" />}
          </p>

          {/* <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold sm:gap-3 sm:text-4xl">
            <span className="min-w-0 wrap-anywhere">Hi, {firstName}</span>

            <WaterDrop width={26} height={36} className="shrink-0" />
          </h1> */}
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold sm:gap-3 sm:text-4xl">
            <span className="min-w-0 wrap-anywhere">Hi, {firstName}</span>

            <span className="flex h-7 w-5 shrink-0 items-center justify-center sm:h-9 sm:w-6.5">
              <WaterDrop width={26} height={36} className="h-full w-full" />
            </span>
          </h1>

          <div className="mt-3 text-sm">
            <DateTimeDisplay />
          </div>
        </div>

        <div className="shrink-0">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
