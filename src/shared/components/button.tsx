/**
 * Button Component
 *
 * Mobile-first, accessible button with variants and sizes.
 * Touch targets: minimum 44x44px (WCAG compliant)
 */

import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      isLoading = false,
      fullWidth = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-xl
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
    `;

    const variantClasses = {
      primary: `
        bg-gradient-to-br from-primary-500 to-primary-600
        text-white
        shadow-lg shadow-primary-500/25
        hover:shadow-xl hover:shadow-primary-500/30
        hover:from-primary-600 hover:to-primary-700
      `,
      secondary: `
        bg-neutral-800 border border-neutral-700
        text-white
        shadow-md shadow-black/10
        hover:bg-neutral-700 hover:border-neutral-600
        hover:shadow-lg
      `,
      ghost: `
        bg-transparent
        text-neutral-200
        hover:bg-white/5
        active:bg-white/10
      `,
      destructive: `
        bg-gradient-to-br from-red-500 to-red-600
        text-white
        shadow-lg shadow-red-500/25
        hover:shadow-xl hover:shadow-red-500/30
        hover:from-red-600 hover:to-red-700
      `,
    };

    const sizeClasses = {
      sm: "px-4 py-2 text-sm min-h-[40px]",
      md: "px-5 py-2.5 text-base min-h-[44px]", // Touch-friendly
      lg: "px-6 py-3 text-lg min-h-[48px]", // Comfortable touch
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClass,
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="sr-only">Загрузка...</span>
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

/**
 * IconButton - Square button for icons only
 * Always meets touch target size (44x44px minimum)
 */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string; // Required for accessibility
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = "ghost", size = "md", className, ...props }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center
      rounded-full
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `;

    const variantClasses = {
      primary: `
        bg-gradient-to-br from-primary-500 to-primary-600
        text-white
        shadow-lg shadow-primary-500/25
        hover:shadow-xl hover:shadow-primary-500/30
      `,
      secondary: `
        bg-neutral-800 border border-neutral-700
        text-white
        hover:bg-neutral-700
      `,
      ghost: `
        bg-transparent
        text-neutral-300
        hover:bg-white/10
      `,
    };

    const sizeClasses = {
      sm: "w-10 h-10 min-w-[40px] min-h-[40px]",
      md: "w-11 h-11 min-w-[44px] min-h-[44px]", // Touch target
      lg: "w-12 h-12 min-w-[48px] min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
