'use client';

import { FC, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/card.css';

export enum CardVariant {
  DEFAULT = 'default',
  ELEVATED = 'elevated',
  OUTLINED = 'outlined',
  GHOST = 'ghost',
}

export enum CardPadding {
  NONE = 'none',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  children: ReactNode;
};

export const Card: FC<Props> = ({
  variant = CardVariant.DEFAULT,
  padding = CardPadding.MD,
  hover = false,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'card',
        `card--${variant}`,
        padding !== CardPadding.NONE && `card--padding-${padding}`,
        hover && 'card--hover',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

type CardHeaderProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export const CardHeader: FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('card__header', className)} {...props}>
      {children}
    </div>
  );
};

type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: ReactNode;
};

export const CardTitle: FC<CardTitleProps> = ({
  as: Component = 'h3',
  children,
  className,
  ...props
}) => {
  return (
    <Component className={cn('card__title', className)} {...props}>
      {children}
    </Component>
  );
};

type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

export const CardDescription: FC<CardDescriptionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p className={cn('card__description', className)} {...props}>
      {children}
    </p>
  );
};

type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const CardContent: FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
};

type CardFooterProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export const CardFooter: FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('card__footer', className)} {...props}>
      {children}
    </div>
  );
};
