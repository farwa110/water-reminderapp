"use client";

import { GlassWater } from "lucide-react";
import { formatTime } from "@/lib/utils";

type WaterLog = {
  id: string;
  amount_ml: number;
  drank_at: string;
};

type Props = {
  logs: WaterLog[];
  busy: boolean;
  editingId: string | null;
  editAmount: string;
  onStartEdit: (log: WaterLog) => void;
  onEditAmountChange: (value: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReset: () => Promise<void>;
};

export default function DrinkLog({ logs, busy, editingId, editAmount, onStartEdit, onEditAmountChange, onCancelEdit, onSaveEdit, onDelete, onReset }: Props) {
  return (
    <section className="rounded-3xl border border-(--border) bg-white p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Today’s drink log</h2>
          <p className="mt-1 text-sm text-(--muted)">What you drank and when</p>
        </div>

        {logs.length > 0 && (
          <button type="button" disabled={busy} onClick={() => void onReset()} className="rounded-xl border border-(--border) px-3 py-2 text-sm text-(--coral) disabled:opacity-50">
            Reset today
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-(--teal-light) p-5 text-sm text-(--muted)">No drinks recorded yet. Log a glass after you drink it.</p>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {logs.map((log) => (
            <li key={log.id} className="rounded-2xl border border-(--border) p-4">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#409e9e]/20 bg-(--teal-light)">
                  <svg width="30" height="42" viewBox="0 0 32 44" fill="none">
                    <path d="M16 2C16 2 3 20 3 29C3 36.2 8.8 42 16 42C23.2 42 29 36.2 29 29C29 20 16 2 16 2Z" fill="#409e9e" />
                    <path d="M10 27C8.5 30.5 9.5 34 12 35.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{log.amount_ml} ml</p>
                  <p className="text-sm text-(--muted)">Drank at {formatTime(log.drank_at)}</p>
                </div>

                <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-(--teal-light)">
                  <GlassWater size={32} strokeWidth={1.5} stroke="#409e9e" />
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-5">
                <button type="button" disabled={busy} onClick={() => onStartEdit(log)} aria-label={`Edit drink at ${formatTime(log.drank_at)}`} className="text-sm font-semibold text-(--teal) disabled:opacity-50">
                  Edit
                </button>

                <button type="button" disabled={busy} onClick={() => void onDelete(log.id)} aria-label={`Delete drink at ${formatTime(log.drank_at)}`} className="text-sm text-(--coral) disabled:opacity-50">
                  Delete
                </button>
              </div>

              {editingId === log.id && (
                <form
                  className="mt-4 flex flex-wrap items-center gap-2 border-t border-(--border) pt-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!busy) void onSaveEdit(log.id);
                  }}
                >
                  <label className="flex items-center gap-2 text-sm">
                    Amount
                    <input type="number" min="1" step="1" required disabled={busy} value={editAmount} onChange={(event) => onEditAmountChange(event.target.value)} className="w-24 rounded-xl border border-(--border) px-3 py-2" />
                    ml
                  </label>

                  <button type="submit" disabled={busy} className="rounded-xl bg-(--teal) px-3 py-2 text-sm text-white disabled:opacity-50">
                    Save
                  </button>

                  <button type="button" disabled={busy} onClick={onCancelEdit} className="px-2 text-sm text-(--muted) disabled:opacity-50">
                    Cancel
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
