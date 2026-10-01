"use client";

import { useRef } from "react";
import { Cookie, ShieldCheck, X } from "lucide-react";

export default function CookieBanner() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} aria-label="Open cookie information" className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#409e9e] text-white shadow-lg transition hover:scale-105 hover:bg-[#328383] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#409e9e]">
        <Cookie size={25} strokeWidth={1.8} />
      </button>

      <dialog ref={dialogRef} aria-labelledby="cookie-title" className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-[#dce4e5] bg-[#fffdfa] p-6 text-[#19332f] shadow-2xl backdrop:bg-black/25 backdrop:backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#edf9f7] p-3 text-[#409e9e]">
              <Cookie size={26} strokeWidth={1.8} />
            </div>

            <h2 id="cookie-title" className="font-serif text-2xl font-bold">
              A little cookie note
            </h2>
          </div>

          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close cookie information" className="rounded-full p-2 text-[#607574] transition hover:bg-[#edf9f7]">
            <X size={20} />
          </button>
        </div>

        <p className="mt-5 text-sm leading-6 text-[#607574]">Ripple is a demo portfolio project designed to make daily water intake tracking feel simple and gentle.</p>

        <div className="mt-5 rounded-2xl border border-[#dce4e5] bg-[#edf9f7] p-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck size={19} className="text-[#409e9e]" />
            Authentication & local storage
          </div>

          <p className="mt-2 text-sm leading-6 text-[#607574]">Ripple uses Clerk, a third-party service, for sign-in and account management. Clerk uses cookies and browser storage for authentication. Your water goal and daily logs are saved in this browser using local storage.</p>

          <a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-[#19332f] underline underline-offset-4">
            Read Clerk’s privacy policy
          </a>
        </div>

        <p className="mt-4 text-xs leading-5 text-[#607574]">This panel provides information only. It does not change or disable cookies.</p>

        <button type="button" onClick={() => dialogRef.current?.close()} className="mt-6 w-full rounded-2xl bg-[#409e9e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#328383]">
          Got it
        </button>
      </dialog>
    </>
  );
}
