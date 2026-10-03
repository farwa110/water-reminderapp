import OnboardingForm from "@/components/OnboardingForm";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-(--background) text-(--foreground)">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-28 h-48 w-48 rounded-full bg-(--peach-light)" />

      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-(--teal-light)" />

      <div className="relative mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-10">
        {/* <header className="relative overflow-hidden rounded-3xl border border-(--border) bg-white p-4 sm:p-6 lg:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-(--teal-light)" />

          <div className="relative flex flex-wrap items-center justify-between gap-1 sm:gap-2">
            <Link href="/" className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <Image src="/water-drop.png" alt="" width={36} height={48} className="h-8 w-auto object-contain sm:h-10" />
              <span className="text-xl font-bold sm:text-2xl">Ripple</span>
            </Link>

            <Link href="/" className="py-2 text-xs font-semibold text-(--coral) hover:underline sm:py-0 sm:text-sm">
              ← Back to welcome
            </Link>
          </div>
        </header> */}
        <OnboardingHeader />

        <OnboardingForm />
      </div>
    </main>
  );
}
