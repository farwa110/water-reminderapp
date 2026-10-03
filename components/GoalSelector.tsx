"use client";

import type { Dispatch, SetStateAction } from "react";
import { GLASS_ML } from "@/lib/calculateWaterGoal";

type Props = {
  recommendedGlasses: number;
  glasses: number;
  setGlasses: Dispatch<SetStateAction<number | null>>;
  saving: boolean;
  saveError: string;
  canSave: boolean;
  onSave: () => Promise<void>;
};

export default function GoalSelector({ recommendedGlasses, glasses, setGlasses, saving, saveError, canSave, onSave }: Props) {
  const totalMl = glasses * GLASS_ML;

  return (
    <section className="min-w-0 rounded-3xl border border-(--border) bg-white p-5 sm:p-8 lg:p-10">
      <div className="text-center">
        <span className="inline-flex rounded-full bg-(--teal-light) px-4 py-2 text-xs font-semibold text-(--teal) sm:text-sm">Ripple suggests {recommendedGlasses} glasses</span>

        <h2 className="mt-5 text-xl font-bold sm:text-2xl">How many glasses a day?</h2>

        <p className="mt-2 text-sm text-(--muted)">One glass = {GLASS_ML} ml</p>

        <div className="mt-6 sm:mt-8">
          <div className="flex items-center justify-center gap-3 sm:gap-8">
            <button type="button" disabled={saving || glasses <= 1} onClick={() => setGlasses((current) => Math.max(1, (current ?? 1) - 1))} aria-label="Remove one glass" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--teal-light) text-2xl font-bold text-(--teal) disabled:opacity-40 sm:h-14 sm:w-14">
              −
            </button>

            <p aria-live="polite" aria-atomic="true" className="w-24 min-w-0 break-all text-center text-7xl font-bold leading-none tabular-nums text-(--foreground) sm:w-auto sm:min-w-40 sm:text-[120px]">
              {glasses}
            </p>

            <button type="button" disabled={saving} onClick={() => setGlasses((current) => (current ?? 0) + 1)} aria-label="Add one glass" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--teal) text-2xl font-bold text-white hover:opacity-90 disabled:opacity-40 sm:h-14 sm:w-14">
              +
            </button>
          </div>

          <p className="mt-4 text-(--muted)">{glasses === 1 ? "glass" : "glasses"} a day</p>
        </div>

        <div className="mt-6 rounded-2xl bg-(--teal-light) px-4 py-5 sm:mt-8 sm:px-5">
          <p className="text-sm text-(--muted)">Your daily water target</p>

          <p className="mt-1 text-3xl font-bold text-(--teal) wrap-anywhere">{totalMl.toLocaleString()} ml</p>
        </div>

        {glasses !== recommendedGlasses && (
          <button type="button" disabled={saving} onClick={() => setGlasses(recommendedGlasses)} className="mt-4 text-sm font-semibold text-(--teal) underline underline-offset-4 disabled:opacity-50">
            Use suggested goal · {recommendedGlasses} glasses
          </button>
        )}
      </div>

      <div className="mt-6 border-t border-(--border) pt-6 sm:mt-8">
        {saveError && (
          <p role="alert" className="mb-4 rounded-2xl bg-(--peach-light) p-4 text-sm text-(--foreground) wrap-anywhere">
            {saveError}
          </p>
        )}

        {/* <button type="button" onClick={() => void onSave()} disabled={saving || !canSave} className="min-h-14 w-full rounded-2xl bg-(--teal) px-4 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:text-lg">
          {saving ? "Saving your routine…" : "Save goal & open dashboard →"}
        </button> */}
        <button type="button" onClick={() => void onSave()} disabled={saving || !canSave} className="min-h-12 w-full rounded-2xl bg-(--teal) px-4 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-14 sm:px-5 sm:py-4 sm:text-lg">
          {saving ? (
            "Saving your routine…"
          ) : (
            <>
              <span className="sm:hidden">Save goal →</span>
              <span className="hidden sm:inline">Save goal &amp; open dashboard →</span>
            </>
          )}
        </button>

        <p className="mt-3 text-center text-xs leading-5 text-(--muted)">You can change your goal and routine later.</p>
      </div>
    </section>
  );
}
