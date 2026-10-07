"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  title: string;
  icon: ReactNode;
  summary?: string;
  children: ReactNode;
  position: "left" | "center" | "right";
};

export default function MobileBottomSheet({ title, icon, summary, children, position }: Props) {
  const [mobile, setMobile] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const dialogId = useId();

  //   const positionClass = {
  //     left: "left-0",
  //     center: "left-1/3",
  //     right: "left-2/3",
  //   }[position];

  const positionClass = {
    left: "left-4 rounded-l-3xl border-l",
    center: "left-[calc(1rem+(100%-2rem)/3)]",
    right: "right-4 rounded-r-3xl border-r",
  }[position];

  const label = {
    left: "Reminders",
    center: "History",
    right: "Today’s plan",
  }[position];

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");

    function updateLayout() {
      setMobile(query.matches);
      setOpen(false);
    }

    updateLayout();
    query.addEventListener("change", updateLayout);

    return () => query.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (!mobile || !open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;

    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [mobile, open]);

  if (mobile === false) {
    return <>{children}</>;
  }

  if (mobile === null) {
    return null;
  }

  return createPortal(
    <>
      {/* <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={summary ? `${title}: ${summary}` : title}
        className={`fixed bottom-0 z-40 flex w-1/3 flex-col
                    items-center justify-center gap-1.5
                    border-t border-(--border) bg-(--background)
                    px-1 pt-3
                    pb-[calc(0.75rem+env(safe-area-inset-bottom))]
                    text-(--teal) transition-colors
                    hover:bg-(--teal-light)
                    focus-visible:outline-2
                    focus-visible:outline-(--teal)
                    ${positionClass}`}
      >
        <span aria-hidden="true" className="flex h-6 items-center justify-center">
          {icon}
        </span>

        <span className="text-xs font-semibold">{label}</span>
      </button> */}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={summary ? `${title}: ${summary}` : title}
        className={`fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))]
              z-40 flex h-20 w-[calc((100%-2rem)/3)] flex-col
              items-center justify-center gap-1
              border-y border-white/80
              bg-white/75 backdrop-blur-xl
              shadow-[0_8px_24px_-12px_rgba(25,51,47,0.35)]
              text-(--teal) transition-colors
              hover:bg-white/90
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-(--teal)
              ${positionClass}`}
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-12 items-center justify-center
               rounded-2xl bg-(--teal-light)/80"
        >
          {icon}
        </span>

        <span className="text-[11px] font-semibold tracking-wide">{label}</span>
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={titleId}
        onCancel={() => setOpen(false)}
        onClose={(event) => {
          // Ignore a close event from cleanup if the dialog reopened.
          if (!event.currentTarget.open) setOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full
                   max-w-none border-0 bg-transparent p-0
                   text-(--foreground)
                   backdrop:bg-[#19332f]/35
                   backdrop:backdrop-blur-sm"
      >
        <div className="pointer-events-none flex h-full items-end">
          <div
            className="pointer-events-auto flex max-h-[85dvh]
                       w-full flex-col overflow-hidden rounded-t-3xl
                       bg-(--background) shadow-2xl"
          >
            <div
              aria-hidden="true"
              className="mx-auto mt-3 h-1 w-10 shrink-0
                         rounded-full bg-(--border)"
            />

            <header
              className="flex shrink-0 items-center justify-between
                         gap-3 border-b border-(--border) px-5 py-4"
            >
              <h2 id={titleId} className="text-xl font-bold">
                {title}
              </h2>

              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                aria-label={`Close ${title}`}
                className="flex h-11 w-11 shrink-0 items-center
                           justify-center rounded-full
                           bg-(--teal-light) text-(--teal)"
              >
                <X size={20} />
              </button>
            </header>

            <div
              className="min-h-0 overflow-y-auto overscroll-contain
                         p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              {children}
            </div>
          </div>
        </div>
      </dialog>
    </>,
    document.body,
  );
}
