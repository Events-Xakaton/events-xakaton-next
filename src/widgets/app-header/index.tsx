"use client";

import { CSSProperties, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export type AppHeaderMode = "sticky" | "fixed";

export type AppHeaderProps = {
  mode?: AppHeaderMode;
  title?: string;
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  subRow?: ReactNode;
  useSafeArea?: boolean;
  showDivider?: boolean;
  showTopGap?: boolean;
  topClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  bodyClassName?: string;
  rootStyle?: CSSProperties;
};

export function AppHeader({
  mode = "sticky",
  title,
  left,
  center,
  right,
  subRow,
  useSafeArea = true,
  showDivider = true,
  showTopGap = true,
  topClassName,
  headerClassName,
  rowClassName,
  bodyClassName,
  rootStyle,
}: AppHeaderProps) {
  const rootClassName = cn(
    mode === "fixed" ? "fixed inset-x-0 top-0" : "sticky top-0",
    "z-[200]",
    showDivider && "border-b border-neutral-200/50",
    "bg-[#f2f2f5]",
    topClassName,
  );

  const headerBodyClassName = cn(
    mode === "sticky" && showTopGap && "mb-4 mt-4",
    bodyClassName,
  );

  return (
    <header
      className={rootClassName}
      style={{
        ...(useSafeArea ? { paddingTop: "env(safe-area-inset-top, 0px)" } : null),
        ...(rootStyle ?? null),
      }}
    >
      <div className={headerBodyClassName}>
        <div className={cn("h-14 px-4", headerClassName)}>
          <div className={cn("flex h-full items-center justify-between", rowClassName)}>
            <div className="flex min-w-0 flex-1 items-center">{left ?? <span className="h-6 w-6" aria-hidden />}</div>
            <div className="flex min-w-0 flex-1 items-center justify-center">
              {center ?? (
                title ? <p className="truncate text-[17px] font-semibold tracking-tight text-neutral-900">{title}</p> : null
              )}
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end">{right ?? <span className="h-6 w-6" aria-hidden />}</div>
          </div>
        </div>

        {subRow ? <div className="px-4 pb-2">{subRow}</div> : null}
      </div>
    </header>
  );
}
