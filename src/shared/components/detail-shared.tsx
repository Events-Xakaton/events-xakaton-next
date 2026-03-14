'use client';

import { Ellipsis } from 'lucide-react';
import type { FC, ReactNode} from 'react';
import { useState } from 'react';

import {
  APP_FLOAT_SHADOW_CLASS,
  APP_PANEL_SHADOW_CLASS,
  APP_SECTION_CARD_CLASS,
} from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

import './styles/detail-shared.css';

const SECTION_CARD = APP_SECTION_CARD_CLASS;

type AboutSectionProps = {
  text: string;
  maxLength?: number;
};

export const AboutSection: FC<AboutSectionProps> = ({
  text,
  maxLength = 220,
}) => {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = text.length > maxLength;
  const displayText =
    expanded || !needsExpansion
      ? text
      : `${text.slice(0, maxLength).trimEnd()}...`;

  return (
    <div>
      <p className="about-section__text">
        {displayText || 'Описание пока не заполнено.'}
      </p>
      {needsExpansion && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="about-section__toggle"
        >
          {expanded ? 'Свернуть' : 'Читать далее'}
        </button>
      )}
    </div>
  );
};

type DetailRowProps = {
  icon: ReactNode;
  label: string;
  value: string | ReactNode;
  rightElement?: ReactNode;
  onClick?: () => void;
};

const DETAIL_LABEL_WIDTH = 'w-[58%] min-w-[176px] pr-2';

export const DetailRow: FC<DetailRowProps> = ({
  icon,
  label,
  value,
  rightElement,
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={cn('detail-row', onClick && 'detail-row--clickable')}
    >
      <div className="detail-row__icon" aria-hidden="true">
        {icon}
      </div>
      <span className="detail-row__label">{label}</span>
      <div className={cn('detail-row__value', DETAIL_LABEL_WIDTH)}>
        {typeof value === 'string' ? (
          <span className="detail-row__value-text">{value}</span>
        ) : (
          <div className="detail-row__value-node">{value}</div>
        )}
        {rightElement}
      </div>
    </Component>
  );
};

type StickyActionsPanelProps = {
  leftActions: ReactNode;
  rightAction: ReactNode;
};

export const StickyActionsPanel: FC<StickyActionsPanelProps> = ({
  leftActions,
  rightAction,
}) => {
  return (
    <div
      className="sticky-actions"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
    >
      <div className={cn('sticky-actions__panel', APP_FLOAT_SHADOW_CLASS)}>
        <div className="sticky-actions__inner">
          <div className="sticky-actions__left">{leftActions}</div>
          <div className="sticky-actions__right">{rightAction}</div>
        </div>
      </div>
    </div>
  );
};

export type MenuItemType = {
  id: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
};

type OverflowMenuButtonProps = {
  items: MenuItemType[];
  isOpen: boolean;
  onToggle: () => void;
};

export const OverflowMenuButton: FC<OverflowMenuButtonProps> = ({
  items,
  isOpen,
  onToggle,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="overflow-menu-button">
      <button
        type="button"
        onClick={onToggle}
        className={cn('overflow-menu-button__trigger', APP_FLOAT_SHADOW_CLASS)}
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
          <div
            className="overflow-menu-button__backdrop"
            onClick={onToggle}
            aria-hidden="true"
          />
          <div
            className={cn(
              'overflow-menu-button__dropdown',
              APP_PANEL_SHADOW_CLASS,
            )}
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
                  'overflow-menu-button__item',
                  item.danger
                    ? 'overflow-menu-button__item--danger'
                    : 'overflow-menu-button__item--default',
                  index !== 0 && 'overflow-menu-button__item--bordered',
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
};
