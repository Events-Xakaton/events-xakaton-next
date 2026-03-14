'use client';

import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, ButtonVariant } from '@/shared/components/button';
import { Card, CardPadding, CardVariant } from '@/shared/components/card';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  SAFE_AREA_TOP,
  getDetailsBottomPadding,
} from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

import './styles/details-layout.css';

function stableBackdrop(key: string): string {
  const variants = [
    'linear-gradient(180deg, #4c5f7f 0%, #2b3c5b 58%, #0f172a 100%)',
    'linear-gradient(180deg, #466b55 0%, #2a3f35 58%, #111827 100%)',
    'linear-gradient(180deg, #655482 0%, #3a2f5c 58%, #111827 100%)',
    'linear-gradient(180deg, #6e5b49 0%, #443729 58%, #17120f 100%)',
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
    <Card
      variant={CardVariant.OUTLINED}
      padding={CardPadding.MD}
      className={cn('details-section', className)}
    >
      {title ? (
        <h3 className="details-section__title">
          {title}
        </h3>
      ) : null}
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
    <div className="details-info-row">
      <div className="details-info-row__icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="details-info-row__title">
          {title}
        </p>
        {subtitle ? (
          <p className="details-info-row__subtitle">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ?? null}
    </div>
  );
}

function BackButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      variant={ButtonVariant.SECONDARY}
      className={cn('back-button', className)}
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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroBackground = coverUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(2,6,23,0.72) 100%), url('${coverUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: stableBackdrop(entityKey) };

  return (
    <div
      className="details-page"
      style={{
        minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
        paddingTop: SAFE_AREA_TOP,
      }}
    >
      <div
        className={cn(
          'details-page__compact-header',
          showCompactHeader
            ? 'details-page__compact-header--visible'
            : 'details-page__compact-header--hidden',
        )}
        style={{ top: 0 }}
      >
        <div
          className="details-page__compact-header-inner"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 12px)',
            paddingRight: 'calc(env(safe-area-inset-right, 0px) + 12px)',
          }}
        >
          <BackButton onClick={onBack} className="pointer-events-auto" />
          <p className="details-page__compact-title">
            {title}
          </p>
          <span className="h-11 w-11 shrink-0" aria-hidden />
        </div>
      </div>

      <section
        className="details-page__hero"
        style={{ ...heroBackground, minHeight: 'min(46dvh, 420px)' }}
      >
        {!coverUrl ? (
          <div className="details-page__hero-noise" />
        ) : null}
        <div className="details-page__hero-scrim" />

        <div
          className="details-page__hero-controls"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
            paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 12px)',
            paddingRight: 'calc(env(safe-area-inset-right, 0px) + 12px)',
          }}
        >
          <BackButton onClick={onBack} />
          {rightTop ?? <span />}
        </div>

        <div
          className="details-page__hero-content"
          style={{ minHeight: 'min(46dvh,420px)' }}
        >
          <div className="details-page__avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={subtitle ?? title}
                className="details-page__avatar-img"
                loading="lazy"
              />
            ) : (
              (avatarFallback ?? 'U')
            )}
          </div>
          {subtitle ? (
            <p className="details-page__subtitle">{subtitle}</p>
          ) : null}
          <h1 className="details-page__title">
            {title}
          </h1>
          {metaLine ? (
            <p className="details-page__meta-line">
              {metaLine}
            </p>
          ) : null}
        </div>
      </section>

      <div className="details-page__summary">
        {summaryCard}
      </div>

      <div
        className="details-page__sections"
        style={{ paddingBottom: getDetailsBottomPadding() }}
      >
        {sections}
      </div>

      <div
        className="details-page__sticky"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        <div className="details-page__sticky-inner">{stickyActions}</div>
      </div>
    </div>
  );
}
