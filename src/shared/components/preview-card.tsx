'use client';

import { Pencil, RefreshCw } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import { APP_PREVIEW_SCRIM_CLASS } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

import './styles/preview-card.css';

type Props = {
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

export const PreviewCard: FC<Props> = ({
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
}) => {
  return (
    <div className="preview-card">
      <div
        className="preview-card__background"
        style={{ background }}
        data-testid="cover-preview-background"
      >
        <div className={cn('preview-card__scrim', APP_PREVIEW_SCRIM_CLASS)} />
        {showChangeBackgroundButton && (
          <div className="preview-card__top-left">
            <button
              type="button"
              onClick={onChangeBackground}
              data-testid="cover-change-background"
              className="preview-card__change-bg-button"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Другой фон
            </button>
          </div>
        )}
        {(extraActions || (showEditIndicator && onTitleClick)) ? (
          <div className="preview-card__top-right">
            {extraActions}
            {showEditIndicator && onTitleClick ? (
              <button
                type="button"
                onClick={onTitleClick}
                className="preview-card__edit-button"
                aria-label="Редактировать заголовок"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="preview-card__content">
          <div className="preview-card__title-wrapper">
            {titleEditing ? (
              titleEditor
            ) : (
              <div className="preview-card__title-inner">
                <h2
                  className={cn(
                    'preview-card__title',
                    onTitleClick && 'preview-card__title--clickable',
                  )}
                  onClick={onTitleClick}
                >
                  <span>{title}</span>
                </h2>
              </div>
            )}
            {titleHint ?? null}
            {subtitle ? (
              <p className="preview-card__subtitle">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
