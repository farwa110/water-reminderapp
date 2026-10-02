import { GlassWater } from "lucide-react";

export default function RippleLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="fixed inset-0 z-50 flex items-center justify-center bg-[#fffdfa]/70 px-6 backdrop-blur-md">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-[#409e9e]/20 bg-(--teal-light) shadow-sm motion-safe:animate-pulse">
          <GlassWater size={64} strokeWidth={1.5} className="text-(--teal)" aria-hidden="true" />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-(--foreground)">Loading Ripple…</h2>

        <p className="mt-2 text-sm leading-6 text-(--muted)">We help you stay hydrated.</p>
      </div>
    </div>
  );
}
