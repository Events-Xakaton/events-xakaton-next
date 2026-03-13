"use client";

import { cn } from "@/shared/lib/utils";
import { ACTIVE_GRADIENT_CLASS } from "@/shared/lib/ui-styles";

/**
 * Tabs Component - Mobile-friendly tab switcher
 */
export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="rounded-xl bg-neutral-800 p-1">
      <div
        className={cn(
          "grid gap-1",
          items.length <= 1 && "grid-cols-1",
          items.length === 2 && "grid-cols-2",
          items.length === 3 && "grid-cols-3",
          items.length >= 4 && "grid-cols-4"
        )}
      >
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              // Touch target - 44px minimum
              "min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium",
              "transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-primary-500",
              value === item.value
                ? ACTIVE_GRADIENT_CLASS
                : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
            )}
            aria-selected={value === item.value}
            role="tab"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
