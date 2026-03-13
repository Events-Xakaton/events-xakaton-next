"use client";

import { ReactNode, useState } from "react";
import { Ellipsis } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  APP_FLOAT_SHADOW_CLASS,
  APP_PANEL_SHADOW_CLASS,
  APP_SECTION_CARD_CLASS,
} from "@/shared/lib/ui-styles";

const SECTION_CARD = APP_SECTION_CARD_CLASS;

/**
 * AboutSection - Expandable description с "Читать далее"
 */
export type AboutSectionProps = {
  text: string;
  maxLength?: number;
};

export function AboutSection({ text, maxLength = 220 }: AboutSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = text.length > maxLength;
  const displayText = expanded || !needsExpansion
    ? text
    : `${text.slice(0, maxLength).trimEnd()}...`;

  return (
    <div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">
        {displayText || "Описание пока не заполнено."}
      </p>
      {needsExpansion && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 transition"
        >
          {expanded ? "Свернуть" : "Читать далее"}
        </button>
      )}
    </div>
  );
}

/**
 * DetailRow - Icon + Label + Value layout для информации
 * Горизонтальный layout как в create-screen: icon + label (слева) + value (справа)
 */
export type DetailRowProps = {
  icon: ReactNode;
  label: string;
  value: string | ReactNode;
  rightElement?: ReactNode;
  onClick?: () => void;
};

const DETAIL_LABEL_WIDTH = "w-[58%] min-w-[176px] pr-2";

export function DetailRow({ icon, label, value, rightElement, onClick }: DetailRowProps) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5",
        onClick && "cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition"
      )}
    >
      <div className="text-neutral-700 flex-shrink-0" aria-hidden="true">
        {icon}
      </div>
      <span className="text-sm font-medium text-neutral-900 flex-shrink-0 w-[90px]">
        {label}
      </span>
      <div className={cn("ml-auto flex items-center justify-end gap-2", DETAIL_LABEL_WIDTH)}>
        {typeof value === "string" ? (
          <span className="text-right text-sm leading-6 text-neutral-500 flex-1">
            {value}
          </span>
        ) : (
          <div className="flex items-center justify-end gap-2 flex-1">{value}</div>
        )}
        {rightElement}
      </div>
    </Component>
  );
}

/**
 * StickyActionsPanel - Fixed bottom panel с CTA кнопками
 */
export type StickyActionsPanelProps = {
  leftActions: ReactNode;
  rightAction: ReactNode;
};

export function StickyActionsPanel({ leftActions, rightAction }: StickyActionsPanelProps) {
  return (
    <div
      className="fixed inset-x-0 z-[20] px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
    >
      <div className={cn("mx-auto w-full max-w-md rounded-[26px] border border-neutral-200/80 bg-white/95 p-2 backdrop-blur", APP_FLOAT_SHADOW_CLASS)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">{leftActions}</div>
          <div className="flex-1">{rightAction}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * OverflowMenuButton - Three-dots menu (top-right)
 */
export type MenuItemType = {
  id: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
};

export type OverflowMenuButtonProps = {
  items: MenuItemType[];
  isOpen: boolean;
  onToggle: () => void;
};

export function OverflowMenuButton({ items, isOpen, onToggle }: OverflowMenuButtonProps) {
  if (items.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn("fixed z-[30] inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-neutral-900 backdrop-blur hover:bg-white active:scale-[0.98]", APP_FLOAT_SHADOW_CLASS)}
        style={{
          top: `calc(env(safe-area-inset-top, 0px) + 20px)`,
          right: `calc(env(safe-area-inset-right, 0px) + 12px)`,
        }}
        aria-label="Меню действий"
        aria-expanded={isOpen}
      >
        <Ellipsis className="h-6 w-6" aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-[25]"
            onClick={onToggle}
            aria-hidden="true"
          />
          {/* Menu dropdown */}
          <div
            className={cn("fixed z-[30] w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white", APP_PANEL_SHADOW_CLASS)}
            style={{
              top: `calc(env(safe-area-inset-top, 0px) + 76px)`,
              right: `calc(env(safe-area-inset-right, 0px) + 12px)`,
            }}
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onToggle();
                  item.onClick();
                }}
                className={cn(
                  "block w-full min-h-[44px] px-4 py-3 text-left text-sm transition",
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-neutral-900 hover:bg-neutral-100",
                  index !== 0 && "border-t border-neutral-100"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
