import OnboardingForm from "@/components/OnboardingForm";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-(--background) text-(--foreground)">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-28 h-48 w-48 rounded-full bg-(--peach-light)" />

      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-(--teal-light)" />

      <div className="relative mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-10">
        <OnboardingHeader />

        <OnboardingForm />
      </div>
    </main>
  );
}
