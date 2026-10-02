import Image from "next/image";
import Link from "next/link";
import WaterAmbience from "./WaterAmbience";

export default function MainHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-8 sm:pt-6">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between overflow-hidden rounded-3xl border border-white/60 bg-white/25 px-5 py-3 shadow-[0_8px_32px_rgba(25,51,47,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl sm:px-7">
        {/* Soft glass reflection */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-[#409e9e]/5" />

        <Link href="/" aria-label="Ripple home" className="relative z-10 flex items-center gap-2">
          <Image src="/water-drop.png" alt="" width={32} height={40} className="h-9 w-auto object-contain" />

          <span className="font-serif text-xl font-bold tracking-wide text-(--foreground)">Ripple</span>
        </Link>

        <div className="relative z-10">
          <WaterAmbience />
        </div>
      </div>
    </header>
  );
}
