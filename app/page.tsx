import Image from "next/image";
import Link from "next/link";
import MainHeader from "@/components/MainHeader";

export default function Home() {
  return (
    // <main className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-(--teal-light) px-5 py-10 text-(--foreground)">
    <main className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-(--teal-light) px-5 pb-10 pt-32 text-(--foreground)">
      <MainHeader />
      {/* Peach corners */}

      {/* Soft peach corners */}
      <div aria-hidden="true" className="peach-float pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-(--peach-light) opacity-60 blur-3xl sm:h-125 sm:w-125" />

      <div aria-hidden="true" className="peach-float peach-float-delayed pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-(--peach-light) opacity-60 blur-3xl sm:h-125 sm:w-125" />
      {/* Animated background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute flex h-[140vmax] w-[140vmax] items-center justify-center">
          <span className="ripple-ring" />
          <span className="ripple-ring ripple-ring-two" />
          <span className="ripple-ring ripple-ring-three" />
        </div>
      </div>

      {/* Logo, title and login */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <Image src="/water-drop.png" alt="" width={120} height={150} priority className="ripple-drop h-28 w-auto object-contain sm:h-32" />

        <h1 className="mt-7 text-6xl font-bold tracking-wide sm:text-7xl">RIPPLE</h1>

        {/* <p className="mt-4 text-lg leading-7 text-(--muted)">
          Small sips. Big difference.
          <br />
          One gentle reminder at a time.
        </p> */}
        <p className="mt-4 text-lg leading-7 text-(--muted)">
          Stay hydrated. Feel refreshed.
          <br />
          One gentle reminder at a time.
        </p>

        <div className="mt-10 w-full space-y-3">
          <Link href="/sign-up" className="flex min-h-14 items-center justify-center rounded-2xl bg-(--teal) px-5 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90">
            Get started →
          </Link>

          <p className="mt-3 text-sm text-(--muted)">Create your account with Google or email.</p>
        </div>

        <p className="mt-6 text-sm text-(--muted)">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-(--coral) hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
