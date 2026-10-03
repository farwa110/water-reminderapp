import Link from "next/link";
import { Sun, Moon } from "lucide-react";

type Props = {
  routine: {
    wakeTime: string;
    bedTime: string;
  } | null;
};

export default function GoalRoutine({ routine }: Props) {
  return (
    // <section className="min-w-0 rounded-3xl border border-(--border) bg-white p-5 sm:p-8 lg:p-10">
    <section className="h-full min-w-0 rounded-3xl border border-(--border) bg-white p-5 sm:p-8 lg:p-10">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--teal-light) text-sm font-bold text-(--teal)">✓</span>

        <span className="h-px w-6 shrink-0 bg-(--border) sm:w-10" />

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--teal) text-sm font-bold text-white">2</span>

        <p className="text-xs font-semibold text-(--muted) sm:text-sm">Review your goal</p>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-(--teal) sm:mt-8">Your goal · Step 2 of 2</p>

      <h1 className="mt-3 max-w-lg text-3xl font-bold leading-tight sm:text-5xl">A water goal that fits your day</h1>

      <p className="mt-4 max-w-lg text-sm leading-6 text-(--muted) sm:mt-5 sm:text-base sm:leading-7">A starting goal based on your routine. Adjust it to suit you.</p>

      <div className="mt-6 rounded-2xl bg-(--teal-light) p-4 sm:mt-8 sm:p-5">
        <h3 className="font-semibold">Your daily routine</h3>

        <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="grid grid-cols-[36px_1fr] gap-x-2 gap-y-1">
            <dt className="col-span-2 grid grid-cols-[36px_1fr] items-center gap-2 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--teal-light)">
                <Sun size={24} strokeWidth={1.8} className="text-(--teal)" fill="#409e9e" fillOpacity={0.25} aria-hidden="true" />
              </span>
              <span>Wake time</span>
            </dt>

            <dd className="col-start-2 text-2xl font-bold tabular-nums">{routine?.wakeTime ?? "—"}</dd>
          </div>

          <div className="grid grid-cols-[36px_1fr] gap-x-2 gap-y-1">
            <dt className="col-span-2 grid grid-cols-[36px_1fr] items-center gap-2 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--teal-light)">
                <Moon size={24} strokeWidth={1.8} className="text-(--teal)" fill="#409e9e" fillOpacity={0.25} aria-hidden="true" />
              </span>
              <span>Bedtime</span>
            </dt>

            <dd className="col-start-2 text-2xl font-bold tabular-nums">{routine?.bedTime ?? "—"}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm leading-6 text-(--muted)">Your dashboard uses these times to keep water reminders within your awake hours.</p>
      </div>

      <div className="mt-5 rounded-2xl bg-(--peach-light) p-4 sm:p-5">
        <h3 className="font-semibold">What happens next?</h3>

        <p className="mt-2 text-sm leading-6 text-(--muted)">Save your goal to open your dashboard. There you can log drinks, track your progress and turn on reminders.</p>
      </div>

      <Link href="/onboarding" className="mt-6 inline-block text-sm font-semibold text-(--coral) hover:underline">
        ← Edit my routine
      </Link>
    </section>
  );
}
