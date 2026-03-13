"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * OverflowMenu - Dropdown menu for actions
 * Touch-friendly with proper accessibility
 */
export function OverflowMenu({
  items,
}: {
  items: Array<{ id: string; label: string; danger?: boolean; onClick: () => void }>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Меню действий"
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center",
          "rounded-full",
          "glass",
          "text-lg text-white",
          "transition-all duration-200",
          "hover:bg-white/10",
          "focus-visible:ring-2 focus-visible:ring-primary-500"
        )}
      >
        •••
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-dropdown mt-1 min-w-40 rounded-xl glass border border-neutral-700 p-1 shadow-xl"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={cn(
                "block w-full min-h-[44px] cursor-pointer rounded-lg px-3 py-2",
                "text-left text-sm",
                "transition-colors duration-200",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset",
                item.danger
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-neutral-200 hover:bg-white/5"
              )}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
