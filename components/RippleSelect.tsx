"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
};

export default function RippleSelect({ name, label, options, onValueChange, placeholder = "Choose an option", defaultValue = "", required = false }: Props) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  // Restore the existing onboarding draft.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("ripple-onboarding");
      if (!saved) return;

      const answers = JSON.parse(saved);
      const savedValue = answers?.[name];

      if (options.some((option) => option.value === savedValue)) {
        setValue(savedValue);
      }
    } catch {
      // Keep the default value.
    }
  }, [name, options]);

  useEffect(() => {
    if (!open) return;

    const selectedIndex = options.findIndex((option) => option.value === value);

    optionRefs.current[Math.max(0, selectedIndex)]?.focus();
  }, [open, options, value]);

  useEffect(() => {
    function handleOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  //   function choose(nextValue: string) {
  //     setValue(nextValue);
  //     setOpen(false);
  //     buttonRef.current?.focus();
  //   }
  function choose(nextValue: string) {
    setValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      {/* Keeps FormData and native required validation working. */}
      <select
        name={name}
        value={value}
        required={required}
        tabIndex={-1}
        aria-label={label}
        className="sr-only"
        onChange={(event) => setValue(event.target.value)}
        onInvalid={(event) => {
          event.preventDefault();
          buttonRef.current?.focus();
          setOpen(true);
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        ref={buttonRef}
        type="button"
        aria-label={`${label}: ${selected?.label ?? placeholder}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-(--border) bg-white px-4 py-3 text-left text-base text-(--foreground) outline-none transition-colors hover:border-(--teal) focus-visible:border-(--teal) focus-visible:ring-2 focus-visible:ring-(--teal-light)"
      >
        <span className="min-w-0">{selected?.label ?? placeholder}</span>

        <ChevronDown size={20} strokeWidth={1.8} aria-hidden="true" className={`shrink-0 text-(--teal) transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div id={`${id}-options`} role="listbox" aria-label={label} className="absolute inset-x-0 top-full z-40 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-(--border) bg-white p-2 shadow-lg">
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="option"
              aria-selected={value === option.value}
              tabIndex={-1}
              onClick={() => choose(option.value)}
              onKeyDown={(event) => {
                let nextIndex = index;

                if (event.key === "ArrowDown") {
                  nextIndex = (index + 1) % options.length;
                } else if (event.key === "ArrowUp") {
                  nextIndex = (index - 1 + options.length) % options.length;
                } else if (event.key === "Home") {
                  nextIndex = 0;
                } else if (event.key === "End") {
                  nextIndex = options.length - 1;
                } else {
                  return;
                }

                event.preventDefault();
                optionRefs.current[nextIndex]?.focus();
              }}
              className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm outline-none hover:bg-(--teal-light) focus:bg-(--teal-light) focus:text-(--teal) ${value === option.value ? "bg-(--teal-light) font-semibold text-(--teal)" : "text-(--foreground)"}`}
            >
              {option.label}

              {value === option.value && <Check size={18} aria-hidden="true" className="shrink-0 text-(--teal)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
