"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Home, Plus, Star, User } from "lucide-react";
import { MainTab } from "@/shared/types/navigation";
import { cn } from "@/shared/lib/utils";
import { ACTIVE_GRADIENT_CLASS, SAFE_AREA_BOTTOM } from "@/shared/lib/ui-styles";
import { useNotificationsQuery } from "@/shared/api/notifications-api";

/**
 * BottomNav - Mobile Navigation
 *
 * Accessible bottom navigation with touch-friendly targets.
 * Touch targets: 44x44px minimum (WCAG compliant)
 */
export function BottomNav({ tab, onTab }: { tab: MainTab; onTab: (next: MainTab) => void }) {
  const notificationsQuery = useNotificationsQuery(
    { filter: "all" },
    {
      pollingInterval: 20_000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const [seenCursor, setSeenCursor] = useState<string | null>(null);

  const latestCreatedAt = notificationsQuery.data?.items?.[0]?.createdAt ?? null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("notifications_seen_cursor");
    if (stored) {
      setSeenCursor(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (tab !== "notifications") return;
    if (!latestCreatedAt) return;
    setSeenCursor(latestCreatedAt);
    window.localStorage.setItem("notifications_seen_cursor", latestCreatedAt);
  }, [tab, latestCreatedAt]);

  const hasNewNotifications = useMemo(() => {
    if (!latestCreatedAt) return false;
    if (!seenCursor) return true;
    const latestMs = new Date(latestCreatedAt).getTime();
    const seenMs = new Date(seenCursor).getTime();
    if (!Number.isFinite(latestMs) || !Number.isFinite(seenMs)) {
      return latestCreatedAt !== seenCursor;
    }
    return latestMs > seenMs;
  }, [latestCreatedAt, seenCursor]);

  const items: Array<{ id: MainTab; label: string; Icon: typeof Home }> = [
    { id: "home", label: "Главная", Icon: Home },
    { id: "create", label: "Создать", Icon: Plus },
    { id: "notifications", label: "Уведомления", Icon: Bell },
    { id: "points", label: "Очки", Icon: Star },
    { id: "account", label: "Аккаунт", Icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-fixed bg-[#f2f2f5] pt-2"
      style={{ paddingBottom: `calc(${SAFE_AREA_BOTTOM} + 8px)` }}
      role="navigation"
      aria-label="Основная навигация"
    >
      <div className="mx-auto max-w-md px-4">
        <div className="grid grid-cols-5 gap-1 rounded-2xl border border-neutral-200 bg-white px-2 py-2 shadow-lg">
          {items.map((item) => {
            const active = tab === item.id;
            const Icon = item.Icon;

            return (
              <button
                key={item.id}
                onClick={() => onTab(item.id)}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // Touch target - 44x44px minimum
                  "flex min-h-[44px] min-w-[44px] items-center justify-center",
                  "relative",
                  "rounded-xl",
                  "transition-all duration-200",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                  "active:scale-95",
                  active
                    ? cn(ACTIVE_GRADIENT_CLASS, "shadow-primary-500/30")
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    active && "stroke-[2.5px]"
                  )}
                  aria-hidden="true"
                />
                {item.id === "notifications" && hasNewNotifications ? (
                  <span
                    className="pointer-events-none absolute right-[16px] top-[10px] h-2.5 w-2.5 rounded-full border border-white bg-red-500"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
