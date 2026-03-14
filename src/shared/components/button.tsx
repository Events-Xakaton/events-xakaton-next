'use client';

import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/button.css';

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  GHOST = 'ghost',
  DESTRUCTIVE = 'destructive',
}

export enum ButtonSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
};

export const Button: FC<Props> = ({
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.MD,
  children,
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        'button',
        `button--${variant}`,
        `button--${size}`,
        fullWidth && 'button--full-width',
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="sr-only">Загрузка...</span>
          <svg
            className="button__spinner"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="button__spinner-track"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="button__spinner-fill"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </>
      ) : null}
      {children}
    </button>
  );
};

export enum IconButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  GHOST = 'ghost',
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: ButtonSize;
};

export const IconButton: FC<IconButtonProps> = ({
  icon,
  label,
  variant = IconButtonVariant.GHOST,
  size = ButtonSize.MD,
  className,
  ...props
}) => {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'icon-button',
        `icon-button--${variant}`,
        `icon-button--${size}`,
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
};
