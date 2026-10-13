"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function AppSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Register without asking for notification permission.
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("Ripple service worker registration failed:", error);
      });
    }

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="ripple-app-splash" aria-hidden="true">
      <div className="ripple-splash-content">
        <div className="ripple-splash-logo">
          <Image src="/android-chrome-512x512.png" alt="" width={112} height={112} priority />
        </div>

        <p className="ripple-splash-name">Ripple</p>
        <p className="ripple-splash-tagline">One sip at a time.</p>
      </div>
    </div>
  );
}
