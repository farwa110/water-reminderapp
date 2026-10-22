"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export default function InstallRipple() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    const iosNavigator = navigator as Navigator & {
      standalone?: boolean;
    };

    const updateInstalled = () => {
      setInstalled(standalone.matches || iosNavigator.standalone === true);
    };

    updateInstalled();

    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

    function handleInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    standalone.addEventListener("change", updateInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      standalone.removeEventListener("change", updateInstalled);
    };
  }, []);

  async function handleInstall() {
    if (busy) return;

    if (isIOS) {
      setShowInstructions((current) => !current);
      return;
    }

    if (!installPrompt) return;

    setBusy(true);

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch {
      // The browser may close or reject the installation prompt.
    } finally {
      setInstallPrompt(null);
      setBusy(false);
    }
  }

  if (installed || (!isIOS && !installPrompt)) return null;

  return (
    <div className="mt-5 w-full">
      <button type="button" onClick={() => void handleInstall()} disabled={busy} aria-expanded={isIOS ? showInstructions : undefined} aria-controls={isIOS ? "ripple-install-instructions" : undefined} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-(--teal) bg-white/60 px-5 py-3 text-sm font-semibold text-(--teal) transition-colors hover:bg-white disabled:opacity-60">
        <Download size={18} aria-hidden="true" />
        {busy ? "Opening…" : "Install Ripple"}
      </button>

      {showInstructions && (
        <div id="ripple-install-instructions" className="mt-3 rounded-2xl border border-(--border) bg-white p-4 text-left text-sm leading-6 text-(--foreground)">
          <p className="font-semibold text-(--teal)">Add Ripple to your iPhone or iPad</p>

          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Open this website in Safari.</li>
            <li>Tap Share, then Add to Home Screen.</li>
            <li>If shown, turn on Open as Web App.</li>
            <li>Tap Add, then open Ripple from its home screen icon.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
