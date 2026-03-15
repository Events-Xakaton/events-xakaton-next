'use client';

import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/app-header.css';

export { RankBadge } from './ui/RankBadge';
export { RankProgressBar } from './ui/RankProgressBar';
export { UserRankHeader } from './ui/UserRankHeader';

export type AppHeaderMode = 'sticky' | 'fixed';

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
  mode = 'sticky',
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
  return (
    <header
      className={cn(
        'app-header',
        mode === 'fixed' ? 'app-header--fixed' : 'app-header--sticky',
        showDivider && 'app-header--divider',
        topClassName,
      )}
      style={{
        ...(useSafeArea
          ? { paddingTop: 'env(safe-area-inset-top, 0px)' }
          : null),
        ...(rootStyle ?? null),
      }}
    >
      <div
        className={cn(
          'app-header__body',
          mode === 'sticky' && showTopGap && 'app-header__body--spaced',
          bodyClassName,
        )}
      >
        <div className={cn('app-header__row-wrap', headerClassName)}>
          <div className={cn('app-header__row', rowClassName)}>
            <div className="app-header__slot-left">
              {left ?? <span className="h-6 w-6" aria-hidden />}
            </div>
            <div className="app-header__slot-center">
              {center ??
                (title ? <p className="app-header__title">{title}</p> : null)}
            </div>
            <div className="app-header__slot-right">
              {right ?? <span className="h-6 w-6" aria-hidden />}
            </div>
          </div>
        </div>

        {subRow ? <div className="app-header__sub-row">{subRow}</div> : null}
      </div>
    </header>
  );
}
