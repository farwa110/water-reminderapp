import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-(--background) px-6 text-(--foreground)">
      {/* Background shapes */}
      <div className="absolute -left-24 top-28 h-48 w-48 rounded-full bg-(--peach-light)" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-var(--teal-light)" />

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col items-center">
        {/* Logo and introduction */}
        <div className="flex flex-1 flex-col items-center justify-center pb-4 text-center">
          <Image src="/water-drop.png" alt="Ripple water drop" width={180} height={200} className="h-36 w-auto object-contain" priority />

          <h1 className="mt-8 text-6xl font-bold tracking-tight">Ripple</h1>

          <p className="mt-5 text-xl leading-relaxed text-(--muted)">
            Small sips. Big difference.
            <br />
            Stay hydrated, one reminder at a time.
          </p>
        </div>

        {/* Sign-in buttons */}
        <div className="w-full space-y-4">
          <Link href="/sign-up" className="flex h-16 w-full items-center justify-center gap-4 rounded-2xl border-2 border-(--border) bg-white text-lg font-semibold">
            <span className="text-2xl font-bold text-[#4285F4]">G</span>
            Continue with Google
          </Link>

          <Link href="/sign-up" className="flex h-16 w-full items-center justify-center rounded-2xl bg-(--foreground) text-lg font-semibold text-white">
            Continue with email
          </Link>

          <p className="pt-6 text-center text-base text-(--muted)">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-(--coral)">
              Log in
            </Link>
          </p>
        </div>

        <p className="max-w-xs pb-7 pt-24 text-center text-sm leading-6 text-(--muted)">By continuing you agree to Ripple&apos;s Terms and Privacy Policy.</p>
      </div>
    </main>
  );
}
