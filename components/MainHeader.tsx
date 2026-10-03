import Image from "next/image";
import Link from "next/link";
import WaterAmbience from "./WaterAmbience";

export default function MainHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-8 sm:pt-6">
      <div
        className="
          relative mx-auto flex w-full max-w-7xl
          items-center justify-between gap-3
          overflow-hidden rounded-2xl
          border border-white/60 bg-white/25
          px-4 py-2.5
          shadow-[0_8px_32px_rgba(25,51,47,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]
          backdrop-blur-2xl
          sm:rounded-3xl sm:px-7 sm:py-3
        "
      >
        {/* Soft glass reflection */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-[#409e9e]/5" />

        <Link href="/" aria-label="Ripple home" className="relative z-10 flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Image src="/water-drop.png" alt="" width={32} height={40} className="h-7 w-auto object-contain sm:h-9" />

          <span className="font-serif text-lg font-bold tracking-wide text-(--foreground) sm:text-xl">Ripple</span>
        </Link>

        <div className="relative z-10 flex shrink-0 items-center">
          <WaterAmbience />
        </div>
      </div>
    </header>
  );
}
