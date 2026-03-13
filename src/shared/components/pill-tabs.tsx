"use client";

import { useRef } from "react";
import { cn } from "@/shared/lib/utils";

export type PillTabItem<T extends string = string> = {
  value: T;
  label: string;
  count?: number;
};

export interface PillTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  items: PillTabItem<T>[];
  className?: string;
}

export function PillTabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: PillTabsProps<T>) {
  const buttonRefs = useRef<Map<T, HTMLButtonElement>>(new Map());

  const handleClick = (itemValue: T) => {
    onChange(itemValue);

    // Прокрутить выбранный таб в видимую область
    const button = buttonRefs.current.get(itemValue);
    if (button) {
      button.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-1", className)}>
      {items.map((item) => {
        const isActive = value === item.value;

        return (
          <button
            key={item.value}
            ref={(el) => {
              if (el) {
                buttonRefs.current.set(item.value, el);
              } else {
                buttonRefs.current.delete(item.value);
              }
            }}
            onClick={() => handleClick(item.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full",
              "text-sm font-medium whitespace-nowrap",
              "transition-all duration-200",
              "min-h-[36px]",
              isActive
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200"
            )}
            type="button"
          >
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  isActive ? "text-neutral-300" : "text-neutral-500"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
