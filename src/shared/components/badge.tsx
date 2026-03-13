/**
 * Badge Component
 *
 * Small status indicators and labels.
 * Used for event status, categories, counts, etc.
 */

import { HTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", children, className, ...props }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center
      font-medium rounded-full
      transition-colors duration-200
    `;

    const variantClasses = {
      default: `
        bg-neutral-800 border border-neutral-700
        text-neutral-300
      `,
      primary: `
        bg-primary-500/20 border border-primary-500/30
        text-primary-300
      `,
      success: `
        bg-green-500/20 border border-green-500/30
        text-green-300
      `,
      warning: `
        bg-amber-500/20 border border-amber-500/30
        text-amber-300
      `,
      error: `
        bg-red-500/20 border border-red-500/30
        text-red-300
      `,
      info: `
        bg-blue-500/20 border border-blue-500/30
        text-blue-300
      `,
      outline: `
        bg-transparent border border-neutral-600
        text-neutral-400
      `,
    };

    const sizeClasses = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
    };

    return (
      <span
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

/**
 * StatusBadge - Semantic badge for event/club status
 */
export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "upcoming" | "ongoing" | "past" | "cancelled" | "active" | "draft";
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const variantMap = {
      upcoming: "info" as const,
      ongoing: "success" as const,
      past: "default" as const,
      cancelled: "error" as const,
      active: "success" as const,
      draft: "warning" as const,
    };

    const labelMap = {
      upcoming: "Предстоящее",
      ongoing: "Идёт сейчас",
      past: "Завершено",
      cancelled: "Отменено",
      active: "Активно",
      draft: "Черновик",
    };

    return (
      <Badge ref={ref} variant={variantMap[status]} {...props}>
        {labelMap[status]}
      </Badge>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

/**
 * CountBadge - Numeric badge (e.g., notification count)
 */
export interface CountBadgeProps extends Omit<BadgeProps, "children"> {
  count: number;
  max?: number;
}

export const CountBadge = forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ count, max = 99, variant = "error", ...props }, ref) => {
    const displayCount = count > max ? `${max}+` : count.toString();

    return (
      <Badge ref={ref} variant={variant} size="sm" {...props}>
        {displayCount}
      </Badge>
    );
  }
);

CountBadge.displayName = "CountBadge";
