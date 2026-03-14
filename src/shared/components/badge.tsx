'use client';

import type { FC, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/badge.css';

export enum BadgeVariant {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
  OUTLINE = 'outline',
}

export enum BadgeSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  PAST = 'past',
  CANCELLED = 'cancelled',
  ACTIVE = 'active',
  DRAFT = 'draft',
}

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
};

export const Badge: FC<Props> = ({
  variant = BadgeVariant.DEFAULT,
  size = BadgeSize.MD,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn('badge', `badge--${variant}`, `badge--${size}`, className)}
      {...props}
    >
      {children}
    </span>
  );
};

type StatusBadgeProps = Omit<Props, 'variant'> & {
  status: EventStatus;
};

const statusVariantMap: Record<EventStatus, BadgeVariant> = {
  [EventStatus.UPCOMING]: BadgeVariant.INFO,
  [EventStatus.ONGOING]: BadgeVariant.SUCCESS,
  [EventStatus.PAST]: BadgeVariant.DEFAULT,
  [EventStatus.CANCELLED]: BadgeVariant.ERROR,
  [EventStatus.ACTIVE]: BadgeVariant.SUCCESS,
  [EventStatus.DRAFT]: BadgeVariant.WARNING,
};

const statusLabelMap: Record<EventStatus, string> = {
  [EventStatus.UPCOMING]: 'Предстоящее',
  [EventStatus.ONGOING]: 'Идёт сейчас',
  [EventStatus.PAST]: 'Завершено',
  [EventStatus.CANCELLED]: 'Отменено',
  [EventStatus.ACTIVE]: 'Активно',
  [EventStatus.DRAFT]: 'Черновик',
};

export const StatusBadge: FC<StatusBadgeProps> = ({ status, ...props }) => {
  return (
    <Badge variant={statusVariantMap[status]} {...props}>
      {statusLabelMap[status]}
    </Badge>
  );
};

type CountBadgeProps = Omit<Props, 'children'> & {
  count: number;
  max?: number;
};

export const CountBadge: FC<CountBadgeProps> = ({
  count,
  max = 99,
  variant = BadgeVariant.ERROR,
  ...props
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  return (
    <Badge variant={variant} size={BadgeSize.SM} {...props}>
      {displayCount}
    </Badge>
  );
};
