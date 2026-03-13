"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/button";
import { Card } from "@/shared/components/card";
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  SAFE_AREA_TOP,
  getDetailsBottomPadding,
} from "@/shared/lib/ui-styles";

function stableBackdrop(key: string): string {
  const variants = [
    "linear-gradient(180deg, #4c5f7f 0%, #2b3c5b 58%, #0f172a 100%)",
    "linear-gradient(180deg, #466b55 0%, #2a3f35 58%, #111827 100%)",
    "linear-gradient(180deg, #655482 0%, #3a2f5c 58%, #111827 100%)",
    "linear-gradient(180deg, #6e5b49 0%, #443729 58%, #17120f 100%)",
  ];

  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return variants[hash % variants.length] ?? variants[0];
}

export function DetailsSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card variant="outlined" padding="md" className={cn("bg-neutral-900/75 backdrop-blur-sm", className)}>
      {title ? <h3 className="mb-4 text-[15px] font-display font-semibold tracking-tight text-neutral-100">{title}</h3> : null}
      {children}
    </Card>
  );
}

export function DetailsInfoRow({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[28px_1fr_auto] items-start gap-3 py-2">
      <div className="mt-0.5 text-neutral-100" aria-hidden="true">{icon}</div>
      <div>
        <p className="text-[17px] font-medium leading-tight tracking-tight text-neutral-100">{title}</p>
        {subtitle ? <p className="mt-1 text-[13px] font-normal text-neutral-400">{subtitle}</p> : null}
      </div>
      {right ?? null}
    </div>
  );
}

function BackButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <Button
      variant="secondary"
      className={cn(
        "h-11 w-11 rounded-full border border-white/40 bg-black/72 p-0 text-white shadow-[0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur hover:bg-black/82 active:scale-[0.98]",
        className,
      )}
      onClick={onClick}
      aria-label="Назад"
    >
      <ChevronLeft className="h-7 w-7 stroke-[3.25px]" />
    </Button>
  );
}

export function DetailsPage({
  entityKey,
  title,
  subtitle,
  metaLine,
  avatarUrl,
  avatarFallback,
  coverUrl,
  onBack,
  rightTop,
  summaryCard,
  sections,
  stickyActions,
}: {
  entityKey: string;
  title: string;
  subtitle?: string;
  metaLine?: string;
  avatarUrl?: string | null;
  avatarFallback?: string;
  coverUrl?: string | null;
  onBack: () => void;
  rightTop?: React.ReactNode;
  summaryCard?: React.ReactNode;
  sections: React.ReactNode;
  stickyActions: React.ReactNode;
}) {
  const [showCompactHeader, setShowCompactHeader] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowCompactHeader(window.scrollY > 170);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroBackground = coverUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(2,6,23,0.72) 100%), url('${coverUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: stableBackdrop(entityKey) };

  return (
    <div
      className="relative bg-neutral-950"
      style={{
        minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
        paddingTop: SAFE_AREA_TOP,
      }}
    >
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 z-[30] transition-opacity duration-200",
          showCompactHeader ? "opacity-100" : "opacity-0",
        )}
        style={{ top: 0 }}
      >
        <div
          className="mx-auto relative flex w-full max-w-md items-center justify-between border-b border-white/15 bg-black/75 px-3 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
            paddingLeft: "calc(env(safe-area-inset-left, 0px) + 12px)",
            paddingRight: "calc(env(safe-area-inset-right, 0px) + 12px)",
          }}
        >
          <BackButton onClick={onBack} className="pointer-events-auto" />
          <p className="pointer-events-none absolute left-1/2 w-[min(62vw,230px)] -translate-x-1/2 truncate text-center text-[15px] font-medium tracking-tight text-white">
            {title}
          </p>
          <span className="h-11 w-11 shrink-0" aria-hidden />
        </div>
      </div>

      <section className="relative overflow-hidden" style={{ ...heroBackground, minHeight: "min(46dvh, 420px)" }}>
        {!coverUrl ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_14%,rgba(255,255,255,0.22),transparent_46%)]" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/65" />

        <div
          className="absolute inset-x-0 z-[10] flex items-center justify-between"
          style={{
            top: "calc(env(safe-area-inset-top, 0px) + 20px)",
            paddingLeft: "calc(env(safe-area-inset-left, 0px) + 12px)",
            paddingRight: "calc(env(safe-area-inset-right, 0px) + 12px)",
          }}
        >
          <BackButton onClick={onBack} />
          {rightTop ?? <span />}
        </div>

        <div className="relative z-10 flex min-h-[min(46dvh,420px)] flex-col items-center justify-end px-5 pb-10 text-center text-white">
          <div className="mb-3 grid h-16 w-16 min-h-[64px] min-w-[64px] place-items-center overflow-hidden rounded-full border-2 border-white/85 bg-primary-500 text-sm font-semibold text-white shadow-lg">
            {avatarUrl ? <img src={avatarUrl} alt={subtitle ?? title} className="h-full w-full object-cover" loading="lazy" /> : avatarFallback ?? "U"}
          </div>
          {subtitle ? <p className="text-[13px] font-normal text-white/80">{subtitle}</p> : null}
          <h1 className="mt-1 text-[26px]/[1.06] font-display font-semibold tracking-tight drop-shadow-md">
            {title}
          </h1>
          {metaLine ? <p className="mt-2 text-[12px] font-normal text-white/80">{metaLine}</p> : null}
        </div>
      </section>

      <div className="relative z-20 mx-auto w-full max-w-md -translate-y-7 px-3">
        {summaryCard}
      </div>

      <div className="-mt-5" style={{ paddingBottom: getDetailsBottomPadding() }}>
        {sections}
      </div>

      <div
        className="fixed inset-x-0 z-[20]"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
      >
        <div className="mx-auto w-full max-w-md px-3">{stickyActions}</div>
      </div>
    </div>
  );
}
