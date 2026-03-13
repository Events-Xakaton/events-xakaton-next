"use client";

import { ReactNode } from "react";
import { RefreshCw, Pencil } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { APP_PREVIEW_SCRIM_CLASS } from "@/shared/lib/ui-styles";

export type PreviewCardProps = {
  background: string;
  title: string;
  onChangeBackground: () => void;
  subtitle?: string;
  titleEditing?: boolean;
  onTitleClick?: () => void;
  titleEditor?: ReactNode;
  titleHint?: ReactNode;
  showEditIndicator?: boolean;
  showChangeBackgroundButton?: boolean;
  extraActions?: ReactNode;
};

/**
 * PreviewCard - Карточка с градиентным фоном и заголовком.
 * Используется как hero-блок на экранах создания и деталей ивента/клуба.
 */
export function PreviewCard({
  background,
  title,
  onChangeBackground,
  subtitle,
  titleEditing = false,
  onTitleClick,
  titleEditor,
  titleHint,
  showEditIndicator = false,
  showChangeBackgroundButton = true,
  extraActions,
}: PreviewCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="relative overflow-hidden" style={{ background }} data-testid="cover-preview-background">
        <div className={cn("pointer-events-none absolute inset-0", APP_PREVIEW_SCRIM_CLASS)} />
        {showChangeBackgroundButton && (
          <div className="absolute left-4 top-4 z-10">
            <button
              type="button"
              onClick={onChangeBackground}
              data-testid="cover-change-background"
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/45 bg-white/20 px-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Другой фон
            </button>
          </div>
        )}
        {showEditIndicator && onTitleClick ? (
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => {
                onTitleClick();
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/45 bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
              aria-label="Редактировать заголовок"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
        {extraActions ? (
          <div className="absolute right-4 top-4 z-10">{extraActions}</div>
        ) : null}
        <div className="relative flex min-h-[280px] flex-col justify-end p-6">
          <div className="relative max-w-full">
            {titleEditing ? (
              titleEditor
            ) : (
              <div className="relative">
                <h2
                  className={cn(
                    "block pr-10 text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg",
                    onTitleClick ? "cursor-pointer" : "",
                  )}
                  onClick={onTitleClick}
                >
                  <span>{title}</span>
                </h2>
              </div>
            )}
            {titleHint ?? null}
            {subtitle ? <p className="mt-2 line-clamp-2 text-white/90">{subtitle}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
